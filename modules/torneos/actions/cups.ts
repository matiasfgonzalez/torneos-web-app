"use server";

import { revalidatePath } from "next/cache";
import type { PhaseSeedSource } from "@prisma/client";

import { db } from "@/lib/db";
import { requireActionOrgAccess } from "@/lib/orgAuth";
import { makeStandingsComparator } from "@/lib/standings/config";
import {
  CupSeedError,
  planCupRound,
  type RoundMatchResult,
} from "@/lib/fixture/cups";

/**
 * Copas y fases finales de un torneo (S13).
 *
 * El organizador define las copas **después** de la fase regular y genera cada
 * ronda cuando la anterior terminó. Ese "cuando terminó" no es una limitación
 * del flujo sino del modelo: `Match.homeTeamId` es obligatorio, así que no se
 * puede crear una semifinal antes de saber quién la juega — no hay forma de
 * representar "el ganador de la llave 3". Generar por ronda esquiva el problema
 * sin inventar partidos fantasma.
 *
 * Todo esto es **opt-in**: un torneo de liga simple no crea ninguna copa y su
 * flujo no cambia en nada.
 */

export type CupActionResult =
  | { success: true; message: string }
  | { success: false; error: string };

interface TournamentCtx {
  id: string;
  organizationId: string;
  tiebreakers: unknown;
}

/** Valida que el usuario gestione la liga dueña del torneo. */
async function authForTournament(
  tournamentId: string,
): Promise<{ tournament: TournamentCtx; error?: never } | { tournament?: never; error: string }> {
  const tournament = await db.tournament.findFirst({
    where: { id: tournamentId, deletedAt: null },
    select: { id: true, organizationId: true, tiebreakers: true },
  });
  if (!tournament) return { error: "El torneo no existe" };

  const auth = await requireActionOrgAccess(tournament.organizationId);
  if (auth.error !== undefined) return { error: auth.error };

  return { tournament };
}

/**
 * Cantidad de grupos distintos del torneo (los `TournamentTeam.group`). Lo usa
 * la pantalla de copas para mostrar, en vivo, cuántos clasifican con el modo
 * "por posición en cada grupo".
 */
export async function getTournamentGroupCount(
  tournamentId: string,
): Promise<number> {
  const rows = await db.tournamentTeam.findMany({
    where: { tournamentId, group: { not: null } },
    select: { group: true },
    distinct: ["group"],
  });
  return rows.filter((r) => r.group?.trim()).length;
}

/** Fases del torneo, para armar la pantalla de copas. */
export async function getTournamentPhases(tournamentId: string) {
  return db.tournamentPhase.findMany({
    where: { tournamentId },
    select: {
      id: true,
      name: true,
      type: true,
      order: true,
      cupName: true,
      seedSource: true,
      sourcePhaseId: true,
      seedFrom: true,
      seedTo: true,
      _count: { select: { matches: true } },
    },
    orderBy: { order: "asc" },
  });
}

/**
 * Crea una fase de copa. **No genera partidos**: solo declara de dónde van a
 * salir sus equipos. Los cruces se materializan después con `generateCupRound`,
 * cuando la fase de origen tenga resultados.
 */
export async function createCupPhase(input: {
  tournamentId: string;
  name: string;
  cupName: string;
  seedSource: PhaseSeedSource;
  sourcePhaseId: string;
  seedFrom?: number | null;
  seedTo?: number | null;
}): Promise<CupActionResult> {
  const ctx = await authForTournament(input.tournamentId);
  if (ctx.error !== undefined) return { success: false, error: ctx.error };

  const name = input.name.trim();
  const cupName = input.cupName.trim();
  if (!name || !cupName) {
    return { success: false, error: "La copa y la ronda necesitan un nombre" };
  }

  const source = await db.tournamentPhase.findFirst({
    where: { id: input.sourcePhaseId, tournamentId: input.tournamentId },
    select: { id: true },
  });
  if (!source) {
    return { success: false, error: "La fase de origen no pertenece a este torneo" };
  }

  if (input.seedSource === "STANDINGS") {
    const { seedFrom: from, seedTo: to } = input;
    if (from == null || to == null) {
      return { success: false, error: "Indicá desde y hasta qué posición entra a esta copa" };
    }
    if (!Number.isInteger(from) || !Number.isInteger(to) || from < 1 || to < from) {
      return { success: false, error: "El rango de posiciones no es válido" };
    }
  }

  // `GROUP_POSITION` reusa `seedFrom` = cuántos clasifican por grupo, y `seedTo`
  // = cuántos "mejores terceros" además (0 = ninguno). No hace falta migración.
  if (input.seedSource === "GROUP_POSITION") {
    const perGroup = input.seedFrom;
    const best = input.seedTo ?? 0;
    if (perGroup == null || !Number.isInteger(perGroup) || perGroup < 1) {
      return {
        success: false,
        error: "Indicá cuántos equipos de cada grupo clasifican (al menos 1)",
      };
    }
    if (!Number.isInteger(best) || best < 0) {
      return { success: false, error: "La cantidad de mejores terceros no es válida" };
    }
  }

  const last = await db.tournamentPhase.findFirst({
    where: { tournamentId: input.tournamentId },
    select: { order: true },
    orderBy: { order: "desc" },
  });

  const guardaConfig =
    input.seedSource === "STANDINGS" || input.seedSource === "GROUP_POSITION";

  await db.tournamentPhase.create({
    data: {
      tournamentId: input.tournamentId,
      name,
      cupName,
      // Siempre KNOCKOUT: una copa es eliminación directa y, por serlo, sus
      // partidos NO suman puntos a la tabla general (C6). Es justamente lo que
      // evita que la final de la Copa de Oro mueva el descenso.
      type: "KNOCKOUT",
      order: (last?.order ?? 0) + 1,
      seedSource: input.seedSource,
      sourcePhaseId: input.sourcePhaseId,
      seedFrom: guardaConfig ? input.seedFrom : null,
      seedTo: guardaConfig ? (input.seedTo ?? 0) : null,
    },
  });

  revalidatePath(`/admin/torneos/${input.tournamentId}`);
  return { success: true, message: `${cupName} — ${name} creada.` };
}

/**
 * Tabla de posiciones de una fase, ordenada **con el mismo comparador que usa
 * la pantalla** (`makeStandingsComparator` + los desempates del torneo). Si la
 * siembra ordenara distinto a lo que el usuario ve, el cuadro saldría con
 * equipos que no se corresponden con la tabla y nadie entendería por qué.
 *
 * Usa `TeamPhaseStats` de la fase si existen; si no (torneo de una sola fase),
 * cae a la tabla general de `TournamentTeam`.
 */
async function standingsOfPhase(
  tournamentId: string,
  phaseId: string,
  tiebreakers: unknown,
): Promise<string[]> {
  const comparator = makeStandingsComparator(tiebreakers);

  // `bonusPoints` NO se suma acá a propósito: hoy no lo suma nadie —ni la tabla
  // de posiciones ni el cálculo de standings—, así que sumarlo solo en la
  // siembra haría que el cuadro saliera con equipos distintos a los que muestra
  // la pantalla. Si algún día el ajuste manual se aplica de verdad, hay que
  // hacerlo en un solo lugar y este código lo hereda (anotado en TODO).
  const phaseStats = await db.teamPhaseStats.findMany({
    where: { tournamentPhaseId: phaseId },
    select: {
      tournamentTeamId: true,
      points: true,
      goalDifference: true,
      goalsFor: true,
      goalsAgainst: true,
      wins: true,
    },
  });

  if (phaseStats.length > 0) {
    return [...phaseStats].sort(comparator).map((s) => s.tournamentTeamId);
  }

  const general = await db.tournamentTeam.findMany({
    where: { tournamentId },
    select: {
      id: true,
      points: true,
      goalDifference: true,
      goalsFor: true,
      goalsAgainst: true,
      wins: true,
    },
  });

  return [...general].sort(comparator).map((t) => t.id);
}

/**
 * Grupos de la fase de origen, cada uno ordenado por posición, más el orden
 * global de rendimiento (para el repechaje de terceros y la siembra del cuadro).
 *
 * El grupo sale de `TournamentTeam.group` (lo que el generador escribe y lo que
 * el organizador asignó a mano), no de `TeamPhaseStats.groupId`, que hoy no lo
 * llena nadie. Los stats de ordenamiento salen de `TeamPhaseStats` de la fase
 * si existen; si no, de la tabla general.
 */
async function groupStandingsOfPhase(
  tournamentId: string,
  phaseId: string,
  tiebreakers: unknown,
): Promise<{ groups: { name: string; teamIds: string[] }[]; globalRank: string[] }> {
  const comparator = makeStandingsComparator(tiebreakers);

  const teams = await db.tournamentTeam.findMany({
    where: { tournamentId },
    select: {
      id: true,
      group: true,
      points: true,
      goalDifference: true,
      goalsFor: true,
      goalsAgainst: true,
      wins: true,
    },
  });

  // Los stats por fase pisan a los generales si existen (una fase de grupos
  // guarda su propia tabla en `TeamPhaseStats`).
  const phaseStats = await db.teamPhaseStats.findMany({
    where: { tournamentPhaseId: phaseId },
    select: {
      tournamentTeamId: true,
      points: true,
      goalDifference: true,
      goalsFor: true,
      goalsAgainst: true,
      wins: true,
    },
  });
  const statsById = new Map(phaseStats.map((s) => [s.tournamentTeamId, s]));

  const rows = teams.map((t) => {
    const s = statsById.get(t.id);
    return {
      id: t.id,
      group: t.group?.trim() || null,
      points: s?.points ?? t.points,
      goalDifference: s?.goalDifference ?? t.goalDifference,
      goalsFor: s?.goalsFor ?? t.goalsFor,
      goalsAgainst: s?.goalsAgainst ?? t.goalsAgainst,
      wins: s?.wins ?? t.wins,
    };
  });

  const globalRank = [...rows].sort(comparator).map((r) => r.id);

  const byGroup = new Map<string, typeof rows>();
  for (const r of rows) {
    if (!r.group) continue; // un equipo sin grupo no entra a la clasificación por grupo
    byGroup.set(r.group, [...(byGroup.get(r.group) ?? []), r]);
  }

  const groups = [...byGroup.entries()]
    .sort(([a], [b]) => a.localeCompare(b, "es"))
    .map(([name, rowsG]) => ({
      name,
      teamIds: [...rowsG].sort(comparator).map((r) => r.id),
    }));

  return { groups, globalRank };
}

/** Cruces de una fase con su ganador ya resuelto (penales y walkover incluidos). */
async function resultsOfPhase(phaseId: string): Promise<RoundMatchResult[]> {
  const matches = await db.match.findMany({
    where: { tournamentPhaseId: phaseId },
    select: {
      homeTeamId: true,
      awayTeamId: true,
      status: true,
      homeScore: true,
      awayScore: true,
      penaltyWinnerTeamId: true,
      walkoverWinnerTeamId: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return matches.map((m) => {
    // El orden importa: un walkover define ganador sin importar el marcador, y
    // los penales desempatan un resultado igualado.
    let winnerTeamId: string | null = null;
    if (m.walkoverWinnerTeamId) {
      winnerTeamId = m.walkoverWinnerTeamId;
    } else if (m.penaltyWinnerTeamId) {
      winnerTeamId = m.penaltyWinnerTeamId;
    } else if (
      m.status === "FINALIZADO" &&
      m.homeScore != null &&
      m.awayScore != null &&
      m.homeScore !== m.awayScore
    ) {
      winnerTeamId = m.homeScore > m.awayScore ? m.homeTeamId : m.awayTeamId;
    }
    return { homeTeamId: m.homeTeamId, awayTeamId: m.awayTeamId, winnerTeamId };
  });
}

/**
 * Materializa los cruces de una fase de copa a partir de su origen.
 *
 * Es idempotente por diseño: si la fase ya tiene partidos, no hace nada — un
 * segundo click no puede duplicar un cuadro ya generado.
 */
export async function generateCupRound(
  phaseId: string,
  startDate?: string,
): Promise<CupActionResult> {
  const phase = await db.tournamentPhase.findUnique({
    where: { id: phaseId },
    select: {
      id: true,
      name: true,
      cupName: true,
      tournamentId: true,
      seedSource: true,
      sourcePhaseId: true,
      seedFrom: true,
      seedTo: true,
      _count: { select: { matches: true } },
    },
  });
  if (!phase) return { success: false, error: "La fase no existe" };

  const ctx = await authForTournament(phase.tournamentId);
  if (ctx.error !== undefined) return { success: false, error: ctx.error };

  if (phase._count.matches > 0) {
    return {
      success: false,
      error: "Esta fase ya tiene partidos generados. Eliminalos si querés rehacer el cuadro.",
    };
  }
  if (!phase.seedSource || !phase.sourcePhaseId) {
    return { success: false, error: "La fase no tiene definido de dónde salen sus equipos" };
  }

  let plan;
  try {
    if (phase.seedSource === "STANDINGS") {
      plan = planCupRound({
        source: "STANDINGS",
        standings: await standingsOfPhase(
          phase.tournamentId,
          phase.sourcePhaseId,
          ctx.tournament.tiebreakers,
        ),
        from: phase.seedFrom ?? undefined,
        to: phase.seedTo ?? undefined,
      });
    } else if (phase.seedSource === "GROUP_POSITION") {
      const { groups, globalRank } = await groupStandingsOfPhase(
        phase.tournamentId,
        phase.sourcePhaseId,
        ctx.tournament.tiebreakers,
      );
      plan = planCupRound({
        source: "GROUP_POSITION",
        groups,
        globalRank,
        qualifyPerGroup: phase.seedFrom ?? undefined,
        bestCount: phase.seedTo ?? 0,
      });
    } else {
      plan = planCupRound({
        source: phase.seedSource,
        results: await resultsOfPhase(phase.sourcePhaseId),
      });
    }
  } catch (error) {
    // `CupSeedError` trae un mensaje pensado para el organizador ("faltan
    // resultados", "revisá el rango"): se muestra tal cual.
    if (error instanceof CupSeedError) {
      return { success: false, error: error.message };
    }
    console.error("Error al planificar la ronda de copa:", error);
    return { success: false, error: "No se pudo armar el cuadro" };
  }

  const base = startDate ? new Date(startDate) : new Date();
  if (Number.isNaN(base.getTime())) {
    return { success: false, error: "La fecha de inicio no es válida" };
  }

  await db.match.createMany({
    data: plan.matches.map((m, i) => ({
      tournamentId: phase.tournamentId,
      tournamentPhaseId: phase.id,
      homeTeamId: m.homeTeamId,
      awayTeamId: m.awayTeamId,
      roundNumber: m.roundNumber,
      // Todos el mismo día por defecto; el organizador reprograma cada uno con
      // el formulario de partido, que ya existe.
      dateTime: new Date(base.getTime() + i * 60 * 60 * 1000),
    })),
  });

  revalidatePath(`/admin/torneos/${phase.tournamentId}`);

  const conBye =
    plan.byes.length > 0
      ? ` ${plan.byes.length} ${plan.byes.length === 1 ? "equipo pasa" : "equipos pasan"} sin jugar.`
      : "";

  return {
    success: true,
    message: `${phase.cupName ?? "Fase"} — ${phase.name}: ${plan.matches.length} ${
      plan.matches.length === 1 ? "cruce generado" : "cruces generados"
    }.${conBye}`,
  };
}

/** Elimina una fase de copa. Se niega si ya tiene partidos jugados. */
export async function deleteCupPhase(phaseId: string): Promise<CupActionResult> {
  const phase = await db.tournamentPhase.findUnique({
    where: { id: phaseId },
    select: {
      id: true,
      name: true,
      tournamentId: true,
      matches: {
        select: { status: true, homeScore: true, awayScore: true },
      },
      _count: { select: { derivedPhases: true } },
    },
  });
  if (!phase) return { success: false, error: "La fase no existe" };

  const ctx = await authForTournament(phase.tournamentId);
  if (ctx.error !== undefined) return { success: false, error: ctx.error };

  const jugados = phase.matches.filter(
    (m) => m.status === "FINALIZADO" || m.homeScore != null || m.awayScore != null,
  );
  if (jugados.length > 0) {
    return {
      success: false,
      error: `Esta fase tiene ${jugados.length} ${
        jugados.length === 1 ? "partido jugado" : "partidos jugados"
      }. Borrarla perdería esos resultados.`,
    };
  }

  if (phase._count.derivedPhases > 0) {
    return {
      success: false,
      error: "Hay otras fases que toman sus equipos de esta. Eliminá primero las que dependen de ella.",
    };
  }

  // Los partidos programados sin resultado se van con la fase (cascade).
  await db.tournamentPhase.delete({ where: { id: phaseId } });

  revalidatePath(`/admin/torneos/${phase.tournamentId}`);
  return { success: true, message: `Se eliminó ${phase.name}.` };
}
