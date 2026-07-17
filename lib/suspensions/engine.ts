import { db } from "@/lib/db";
import { MatchStatus } from "@prisma/client";
import { getTeamManagerIdsForTeams, notify } from "@/lib/notifications";
import {
  CardInput,
  computeDesiredSuspensions,
  computeServed,
} from "./rules";

/**
 * Motor de sanciones automáticas (N8).
 *
 * `recomputeTournamentSuspensions` reconcilia, de forma idempotente, las
 * suspensiones ACUMULACION/ROJA de un torneo a partir de sus tarjetas y
 * recalcula las fechas cumplidas de TODAS (incluidas las MANUAL). Sigue el
 * mismo patrón que `recalculateTournamentStandings`: recalcular no duplica ni
 * pierde estado, así que es seguro llamarlo tras cargar/borrar una tarjeta o
 * al finalizar un partido.
 */
export async function recomputeTournamentSuspensions(
  tournamentId: string,
): Promise<void> {
  const tournament = await db.tournament.findUnique({
    where: { id: tournamentId },
    select: { yellowsForSuspension: true, matchesPerRedCard: true },
  });
  if (!tournament) return;

  // Todas las tarjetas del torneo, con la fecha de su partido
  const cards = await db.card.findMany({
    where: { match: { tournamentId } },
    select: {
      id: true,
      matchId: true,
      type: true,
      teamPlayerId: true,
      createdAt: true,
      match: { select: { dateTime: true } },
    },
  });

  // Partidos finalizados del torneo (para contar fechas cumplidas)
  const finalizedMatches = await db.match.findMany({
    where: { tournamentId, status: MatchStatus.FINALIZADO },
    select: { dateTime: true, homeTeamId: true, awayTeamId: true },
  });

  // Agrupar tarjetas por jugador (TeamPlayer)
  const cardsByPlayer = new Map<string, CardInput[]>();
  for (const c of cards) {
    const arr = cardsByPlayer.get(c.teamPlayerId) ?? [];
    arr.push({
      id: c.id,
      matchId: c.matchId,
      type: c.type,
      matchDate: c.match.dateTime,
      createdAt: c.createdAt,
    });
    cardsByPlayer.set(c.teamPlayerId, arr);
  }

  const newKeys = await db.$transaction(
    async (tx) => {
      const existingAuto = await tx.suspension.findMany({
        where: { tournamentId, reason: { in: ["ACUMULACION", "ROJA"] } },
      });

      // Claves de las que YA estaban. Notificar sin esto sería re-avisar la
      // misma suspensión en cada recálculo — y el motor recalcula en cada carga
      // de resultado. `desiredKeys - existingKeys` son las realmente nuevas.
      const existingKeys = new Set(
        existingAuto.map((s) =>
          s.reason === "ROJA"
            ? `R:${s.sourceCardId}`
            : `A:${s.teamPlayerId}:${s.accumulationIndex}`,
        ),
      );

      // Claves de las suspensiones automáticas que DEBEN existir
      const desiredKeys = new Set<string>();

      for (const [teamPlayerId, playerCards] of cardsByPlayer) {
        const desired = computeDesiredSuspensions(playerCards, tournament);
        for (const d of desired) {
          if (d.reason === "ROJA") {
            desiredKeys.add(`R:${d.sourceCardId}`);
            await tx.suspension.upsert({
              where: { sourceCardId: d.sourceCardId! },
              create: {
                teamPlayerId,
                tournamentId,
                reason: "ROJA",
                totalMatches: d.totalMatches,
                triggerDate: d.triggerDate,
                sourceCardId: d.sourceCardId,
              },
              update: {
                totalMatches: d.totalMatches,
                triggerDate: d.triggerDate,
              },
            });
          } else {
            desiredKeys.add(`A:${teamPlayerId}:${d.accumulationIndex}`);
            await tx.suspension.upsert({
              where: {
                teamPlayerId_accumulationIndex: {
                  teamPlayerId,
                  accumulationIndex: d.accumulationIndex!,
                },
              },
              create: {
                teamPlayerId,
                tournamentId,
                reason: "ACUMULACION",
                totalMatches: d.totalMatches,
                triggerDate: d.triggerDate,
                accumulationIndex: d.accumulationIndex,
              },
              update: {
                totalMatches: d.totalMatches,
                triggerDate: d.triggerDate,
              },
            });
          }
        }
      }

      // Borrar automáticas que ya no corresponden (tarjeta eliminada, etc.)
      for (const s of existingAuto) {
        const key =
          s.reason === "ROJA"
            ? `R:${s.sourceCardId}`
            : `A:${s.teamPlayerId}:${s.accumulationIndex}`;
        if (!desiredKeys.has(key)) {
          await tx.suspension.delete({ where: { id: s.id } });
        }
      }

      // Recalcular fechas cumplidas y estado de TODAS (auto + manual)
      const all = await tx.suspension.findMany({
        where: { tournamentId },
        include: { teamPlayer: { select: { tournamentTeamId: true } } },
      });
      for (const s of all) {
        const teamId = s.teamPlayer.tournamentTeamId;
        const teamDates = finalizedMatches
          .filter((m) => m.homeTeamId === teamId || m.awayTeamId === teamId)
          .map((m) => m.dateTime);
        const { servedMatches, isActive } = computeServed(
          s.triggerDate,
          teamDates,
          s.totalMatches,
        );
        if (servedMatches !== s.servedMatches || isActive !== s.isActive) {
          await tx.suspension.update({
            where: { id: s.id },
            data: { servedMatches, isActive },
          });
        }
      }

      return [...desiredKeys].filter((k) => !existingKeys.has(k));
    },
    { timeout: 30000 },
  );

  // Fuera de la transacción a propósito: notificar adentro dejaría avisos de
  // suspensiones que un rollback borra, y alargaría una transacción que ya
  // tiene timeout de 30s con llamadas HTTP a Resend.
  if (newKeys.length > 0) {
    await notifyNewSuspensions(tournamentId, newKeys);
  }
}

/**
 * Avisa a los delegados de las suspensiones recién creadas (S5) — el pendiente
 * (3) de N8.
 *
 * Le llega al **delegado**, no al jugador: es quien arma el equipo y quien
 * puede evitar que lo alineen. Si el jugador además reclamó su ficha, la ve
 * igual en el torneo.
 */
async function notifyNewSuspensions(
  tournamentId: string,
  newKeys: string[],
): Promise<void> {
  try {
    const created = await db.suspension.findMany({
      where: {
        tournamentId,
        OR: [
          {
            sourceCardId: {
              in: newKeys
                .filter((k) => k.startsWith("R:"))
                .map((k) => k.slice(2)),
            },
          },
          ...newKeys
            .filter((k) => k.startsWith("A:"))
            .map((k) => {
              const [, teamPlayerId, index] = k.split(":");
              return { teamPlayerId, accumulationIndex: Number(index) };
            }),
        ],
      },
      select: {
        reason: true,
        totalMatches: true,
        teamPlayer: {
          select: {
            player: { select: { name: true } },
            tournamentTeam: { select: { teamId: true } },
          },
        },
        tournament: { select: { name: true } },
      },
    });

    for (const s of created) {
      await notify(
        await getTeamManagerIdsForTeams([s.teamPlayer.tournamentTeam.teamId]),
        {
          type: "JUGADOR_SUSPENDIDO",
          playerName: s.teamPlayer.player.name,
          tournamentName: s.tournament.name,
          tournamentId,
          matches: s.totalMatches,
          reason: s.reason,
        },
      );
    }
  } catch (error) {
    // El motor no puede fallar por un aviso: la suspensión ya está guardada y
    // es lo que decide si el jugador puede jugar.
    console.error("[suspensiones] No se pudo notificar:", error);
  }
}

/**
 * ¿Tiene el jugador (TeamPlayer) una suspensión activa en su torneo?
 * Se usa para avisar al organizador si lo alinea (carga gol/tarjeta).
 */
export async function hasActiveSuspension(
  teamPlayerId: string,
): Promise<boolean> {
  const count = await db.suspension.count({
    where: { teamPlayerId, isActive: true },
  });
  return count > 0;
}
