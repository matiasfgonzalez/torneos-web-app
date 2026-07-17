"use server";

import { db } from "@/lib/db";
import {
  computeFairPlay,
  computeTeamForm,
  type FairPlayRow,
  type StatCard,
  type StatMatch,
  type StatTeamRef,
  type TeamForm,
} from "@/lib/stats";
import { makeStandingsComparator } from "@/lib/standings/config";

export interface AdvancedStats {
  fairPlay: FairPlayRow[];
  /** Forma de cada equipo, en el orden de la tabla de posiciones. */
  form: TeamForm[];
  /** Para el selector de head-to-head. */
  teams: { tournamentTeamId: string; teamName: string }[];
}

/**
 * Fair play y forma/racha del torneo (S7).
 *
 * Trae los datos crudos (equipos, partidos, tarjetas) y delega el conteo a la
 * capa pura `lib/stats`. La `form` se devuelve en el **orden de la tabla** (mismo
 * comparador que la tabla web), así el ranking de racha se lee al lado de la
 * posición sin sorpresas.
 */
export async function getAdvancedStats(
  tournamentId: string,
): Promise<AdvancedStats> {
  try {
    const [tournament, tournamentTeams, matches, cards] = await Promise.all([
      db.tournament.findUnique({
        where: { id: tournamentId },
        select: { tiebreakers: true },
      }),
      db.tournamentTeam.findMany({
        where: { tournamentId, registrationStatus: "INSCRIPTO" },
        select: {
          id: true,
          points: true,
          goalDifference: true,
          goalsFor: true,
          goalsAgainst: true,
          wins: true,
          team: { select: { id: true, name: true, logoUrl: true } },
        },
      }),
      db.match.findMany({
        where: { tournamentId },
        select: {
          homeTeamId: true,
          awayTeamId: true,
          homeScore: true,
          awayScore: true,
          status: true,
          dateTime: true,
        },
      }),
      db.card.findMany({
        where: { match: { tournamentId } },
        select: { type: true, teamPlayer: { select: { tournamentTeamId: true } } },
      }),
    ]);

    // Orden de la tabla: se ordenan los equipos con el comparador del torneo y
    // ese orden se conserva en `form` (que respeta el orden de entrada).
    const ordered = [...tournamentTeams].sort(
      makeStandingsComparator(tournament?.tiebreakers),
    );

    const teamRefs: StatTeamRef[] = ordered.map((tt) => ({
      tournamentTeamId: tt.id,
      teamId: tt.team.id,
      teamName: tt.team.name,
      teamLogoUrl: tt.team.logoUrl,
    }));

    const statMatches: StatMatch[] = matches.map((m) => ({
      homeTeamId: m.homeTeamId,
      awayTeamId: m.awayTeamId,
      homeScore: m.homeScore,
      awayScore: m.awayScore,
      status: m.status,
      dateTime: m.dateTime,
    }));

    const statCards: StatCard[] = cards
      .filter((c) => c.teamPlayer?.tournamentTeamId)
      .map((c) => ({
        tournamentTeamId: c.teamPlayer!.tournamentTeamId,
        type: c.type,
      }));

    return {
      fairPlay: computeFairPlay(teamRefs, statCards),
      form: computeTeamForm(teamRefs, statMatches),
      teams: teamRefs.map((t) => ({
        tournamentTeamId: t.tournamentTeamId,
        teamName: t.teamName,
      })),
    };
  } catch (error) {
    console.error("Error al obtener estadísticas avanzadas:", error);
    return { fairPlay: [], form: [], teams: [] };
  }
}
