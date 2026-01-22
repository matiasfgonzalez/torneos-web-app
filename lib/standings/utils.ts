import { MatchStatus } from "@prisma/client";

/**
 * Resultado de un partido para cálculo de estadísticas
 */
export interface MatchResult {
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number | null;
  awayScore: number | null;
  status: MatchStatus;
  tournamentPhaseId?: string | null;
}

/**
 * Extrae los datos necesarios para el cálculo de un partido
 */
export function extractMatchResult(match: {
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number | null;
  awayScore: number | null;
  status: MatchStatus;
  tournamentPhaseId?: string | null;
}): MatchResult {
  return {
    homeTeamId: match.homeTeamId,
    awayTeamId: match.awayTeamId,
    homeScore: match.homeScore,
    awayScore: match.awayScore,
    status: match.status,
    tournamentPhaseId: match.tournamentPhaseId,
  };
}

