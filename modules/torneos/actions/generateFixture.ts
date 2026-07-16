"use server";

import { MatchStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireActionOrgAccess } from "@/lib/orgAuth";
import { generateFixture as buildPlan } from "@/lib/fixture/generate";
import { scheduleMatches } from "@/lib/fixture/schedule";
import { reasonWithoutGenerator, supportsFixture } from "@/lib/fixture/formats";

/**
 * Generador de fixture (S1) — capa de servidor.
 *
 * El algoritmo vive en `lib/fixture/*` y es puro. Acá va lo que necesita la
 * base: permisos, la regla de "nunca pisar partidos jugados", y la escritura en
 * una sola transacción.
 *
 * **Por qué la transacción no es opcional:** el plan crea fases, partidos y (en
 * formato de grupos) reescribe el `group` de cada equipo. Si eso se cae a mitad
 * de camino, el torneo queda con media fase de grupos y un fixture incompleto,
 * que es peor que no haber generado nada.
 */

/** Estados que significan "este partido ya se jugó o se está jugando". */
const PLAYED_STATUSES: MatchStatus[] = [
  MatchStatus.EN_JUEGO,
  MatchStatus.ENTRETIEMPO,
  MatchStatus.FINALIZADO,
  MatchStatus.WALKOVER,
];

export interface GenerateFixtureInput {
  tournamentId: string;
  /** Día y hora de la primera jornada (ISO del `datetime-local` del form). */
  startDate: string;
  /** Días entre jornadas. 7 = una fecha por semana. */
  intervalDays: number;
  /** Cantidad de grupos. Solo se usa en formato GRUPOS. */
  groupCount?: number;
  /** Sortear el orden de los equipos antes de armar el fixture. */
  randomize: boolean;
  /** Confirmación explícita para borrar un fixture previo sin resultados. */
  replaceExisting?: boolean;
}

export type GenerateFixtureResult =
  | {
      success: true;
      totalMatches: number;
      rounds: number;
      byes: number;
      replaced: number;
    }
  | { success: false; error: string; needsConfirmation?: boolean };

export async function generateTournamentFixture(
  input: GenerateFixtureInput,
): Promise<GenerateFixtureResult> {
  const tournament = await db.tournament.findFirst({
    where: { id: input.tournamentId, deletedAt: null },
    select: {
      id: true,
      organizationId: true,
      format: true,
      homeAndAway: true,
      tournamentTeams: { select: { id: true }, orderBy: { createdAt: "asc" } },
    },
  });

  if (!tournament) return { success: false, error: "Torneo no encontrado" };

  const auth = await requireActionOrgAccess(tournament.organizationId);
  if (auth.error) return { success: false, error: auth.error };

  if (!supportsFixture(tournament.format)) {
    return {
      success: false,
      error:
        reasonWithoutGenerator(tournament.format) ??
        "Este formato no tiene generador de fixture.",
    };
  }

  const teamIds = tournament.tournamentTeams.map((t) => t.id);
  if (teamIds.length < 2) {
    return {
      success: false,
      error: "Inscribí al menos 2 equipos antes de generar el fixture.",
    };
  }

  // --- Regla de seguridad: nunca pisar partidos jugados ---------------------
  // Se re-verifica en el server aunque la UI ya lo haya chequeado: el cliente
  // pudo cargar la pantalla antes de que alguien cargara un resultado.
  const existing = await db.match.findMany({
    where: { tournamentId: tournament.id },
    select: {
      id: true,
      status: true,
      homeScore: true,
      awayScore: true,
      _count: { select: { goals: true, cards: true } },
    },
  });

  if (existing.length > 0) {
    const played = existing.filter(
      (m) =>
        PLAYED_STATUSES.includes(m.status) ||
        m.homeScore !== null ||
        m.awayScore !== null ||
        m._count.goals > 0 ||
        m._count.cards > 0,
    );

    if (played.length > 0) {
      return {
        success: false,
        error: `El torneo ya tiene ${played.length} ${played.length === 1 ? "partido jugado" : "partidos jugados"}. Generar el fixture borraría sus resultados, goles y tarjetas. Eliminá esos partidos a mano si querés rehacer el fixture.`,
      };
    }

    // Solo hay partidos programados y vacíos: se pueden reemplazar, pero el
    // organizador tiene que decirlo.
    if (!input.replaceExisting) {
      return {
        success: false,
        needsConfirmation: true,
        error: `El torneo ya tiene ${existing.length} ${existing.length === 1 ? "partido programado" : "partidos programados"} sin resultados. ¿Los reemplazo por el fixture nuevo?`,
      };
    }
  }

  // --- Plan (puro) ----------------------------------------------------------
  const startDate = new Date(input.startDate);
  if (Number.isNaN(startDate.getTime())) {
    return { success: false, error: "La fecha de inicio no es válida." };
  }

  let plan;
  try {
    plan = buildPlan(tournament.format, teamIds, {
      homeAndAway: tournament.homeAndAway,
      groupCount: input.groupCount,
      // La semilla se deriva del momento del sorteo: cada generación da un
      // orden distinto, pero el algoritmo sigue siendo puro y testeable.
      seed: input.randomize ? Date.now() % 2147483647 : undefined,
    });
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "No se pudo armar el fixture.",
    };
  }

  // --- Escritura ------------------------------------------------------------
  try {
    await db.$transaction(async (tx) => {
      if (existing.length > 0) {
        // Seguro: acá solo llegan partidos sin resultado (validado arriba)
        await tx.match.deleteMany({ where: { tournamentId: tournament.id } });
      }

      for (const phase of plan.phases) {
        const created = await tx.tournamentPhase.create({
          data: {
            tournamentId: tournament.id,
            name: phase.name,
            type: phase.type,
            order: phase.order,
          },
        });

        const scheduled = scheduleMatches(phase.matches, {
          startDate,
          intervalDays: input.intervalDays,
        });

        if (scheduled.length > 0) {
          await tx.match.createMany({
            data: scheduled.map(({ match, dateTime }) => ({
              tournamentId: tournament.id,
              tournamentPhaseId: created.id,
              homeTeamId: match.homeTeamId,
              awayTeamId: match.awayTeamId,
              roundNumber: match.roundNumber,
              dateTime,
              status: MatchStatus.PROGRAMADO,
            })),
          });
        }
      }

      // Formato de grupos: el sorteo define en qué zona queda cada equipo
      if (plan.groupAssignments) {
        for (const [tournamentTeamId, group] of Object.entries(
          plan.groupAssignments,
        )) {
          await tx.tournamentTeam.update({
            where: { id: tournamentTeamId },
            data: { group },
          });
        }
      }
    });
  } catch (error) {
    console.error("Error al generar el fixture:", error);
    return { success: false, error: "No se pudo guardar el fixture." };
  }

  revalidatePath(`/admin/torneos/${tournament.id}`);
  revalidatePath("/admin/partidos");

  const rounds = new Set(
    plan.phases.flatMap((p) => p.matches.map((m) => m.roundNumber)),
  ).size;

  return {
    success: true,
    totalMatches: plan.totalMatches,
    rounds,
    byes: plan.byes.length,
    replaced: existing.length,
  };
}
