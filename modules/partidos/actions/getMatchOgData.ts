"use server";

import { db } from "@/lib/db";

/**
 * Datos mínimos de un partido para su imagen de previsualización (M3).
 *
 * Query aparte de `getMatchById`, que trae goles, tarjetas y terna: la OG la
 * pide un scraper en cada scrapeo y no tiene sentido hacerle pagar seis niveles
 * de relaciones para dibujar un marcador.
 */
export interface MatchOgData {
  homeName: string;
  awayName: string;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  tournamentName: string;
  organizationName: string | null;
  dateTime: Date;
  stadium: string | null;
  /** Ganador por penales o walkover, si lo hubo (el marcador solo no lo dice). */
  decidedBy: "PENALES" | "WALKOVER" | null;
  penaltyHome: number | null;
  penaltyAway: number | null;
}

export async function getMatchOgData(id: string): Promise<MatchOgData | null> {
  const match = await db.match.findUnique({
    where: { id },
    select: {
      homeScore: true,
      awayScore: true,
      status: true,
      dateTime: true,
      stadium: true,
      penaltyWinnerTeamId: true,
      penaltyScoreHome: true,
      penaltyScoreAway: true,
      walkoverWinnerTeamId: true,
      homeTeam: { select: { team: { select: { name: true } } } },
      awayTeam: { select: { team: { select: { name: true } } } },
      tournament: {
        select: {
          name: true,
          deletedAt: true,
          organization: { select: { name: true } },
        },
      },
    },
  });

  // Torneo eliminado: la ficha da 404, así que la preview tampoco debe mostrarlo.
  if (!match || match.tournament.deletedAt) return null;

  return {
    homeName: match.homeTeam.team.name,
    awayName: match.awayTeam.team.name,
    homeScore: match.homeScore,
    awayScore: match.awayScore,
    status: match.status,
    tournamentName: match.tournament.name,
    organizationName: match.tournament.organization?.name ?? null,
    dateTime: match.dateTime,
    stadium: match.stadium,
    decidedBy: match.walkoverWinnerTeamId
      ? "WALKOVER"
      : match.penaltyWinnerTeamId
        ? "PENALES"
        : null,
    penaltyHome: match.penaltyScoreHome,
    penaltyAway: match.penaltyScoreAway,
  };
}
