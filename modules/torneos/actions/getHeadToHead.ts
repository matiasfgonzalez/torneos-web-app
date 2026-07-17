"use server";

import { db } from "@/lib/db";
import {
  computeHeadToHead,
  type HeadToHead,
  type StatMatch,
} from "@/lib/stats";

export interface HeadToHeadResult {
  aName: string;
  bName: string;
  h2h: HeadToHead;
}

/**
 * Historial entre dos equipos de un torneo (S7).
 *
 * Se acota por `tournamentId` **y** por los dos ids: no se puede pedir el H2H
 * de equipos de otra liga colando ids sueltos. Trae solo los partidos entre
 * ambos (no todos los del torneo) y deja el conteo a la capa pura.
 */
export async function getHeadToHead(
  tournamentId: string,
  aTeamId: string,
  bTeamId: string,
): Promise<HeadToHeadResult | null> {
  if (aTeamId === bTeamId) return null;

  try {
    const [teams, matches] = await Promise.all([
      db.tournamentTeam.findMany({
        where: {
          id: { in: [aTeamId, bTeamId] },
          tournamentId,
        },
        select: { id: true, team: { select: { name: true } } },
      }),
      db.match.findMany({
        where: {
          tournamentId,
          OR: [
            { homeTeamId: aTeamId, awayTeamId: bTeamId },
            { homeTeamId: bTeamId, awayTeamId: aTeamId },
          ],
        },
        select: {
          homeTeamId: true,
          awayTeamId: true,
          homeScore: true,
          awayScore: true,
          status: true,
          dateTime: true,
        },
      }),
    ]);

    // Los dos equipos tienen que existir y pertenecer a este torneo.
    if (teams.length !== 2) return null;

    const aName = teams.find((t) => t.id === aTeamId)?.team.name;
    const bName = teams.find((t) => t.id === bTeamId)?.team.name;
    if (!aName || !bName) return null;

    const statMatches: StatMatch[] = matches.map((m) => ({
      homeTeamId: m.homeTeamId,
      awayTeamId: m.awayTeamId,
      homeScore: m.homeScore,
      awayScore: m.awayScore,
      status: m.status,
      dateTime: m.dateTime,
    }));

    return {
      aName,
      bName,
      h2h: computeHeadToHead(aTeamId, bTeamId, statMatches),
    };
  } catch (error) {
    console.error("Error al obtener head-to-head:", error);
    return null;
  }
}
