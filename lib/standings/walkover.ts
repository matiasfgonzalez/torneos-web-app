import { MatchStatus } from "@prisma/client";

/**
 * Resolución de WALKOVER (N7 / cierra C6).
 *
 * Cuando un partido se marca como WALKOVER, el organizador solo indica el
 * equipo ganador (`walkoverWinnerTeamId`); el servidor fija el marcador
 * automáticamente a `walkoverScore`-0 a favor del ganador. La UI deja de
 * pedir cargar el 3-0 a mano.
 */

export interface WalkoverInput {
  status: MatchStatus | null | undefined;
  walkoverWinnerTeamId: string | null | undefined;
  homeTeamId: string;
  awayTeamId: string;
  walkoverScore: number;
}

export type WalkoverResolution =
  | { ok: true; homeScore: number; awayScore: number }
  | { ok: false; error: string };

/**
 * Devuelve el marcador que corresponde a un WALKOVER, o un error si el
 * equipo ganador no es válido. Solo aplica cuando el status es WALKOVER.
 */
export function resolveWalkover(input: WalkoverInput): WalkoverResolution {
  const { walkoverWinnerTeamId, homeTeamId, awayTeamId, walkoverScore } = input;

  if (!walkoverWinnerTeamId) {
    return {
      ok: false,
      error: "Indicá el equipo ganador del walkover",
    };
  }

  if (
    walkoverWinnerTeamId !== homeTeamId &&
    walkoverWinnerTeamId !== awayTeamId
  ) {
    return {
      ok: false,
      error: "El equipo ganador del walkover debe ser uno de los dos del partido",
    };
  }

  const winnerIsHome = walkoverWinnerTeamId === homeTeamId;
  return {
    ok: true,
    homeScore: winnerIsHome ? walkoverScore : 0,
    awayScore: winnerIsHome ? 0 : walkoverScore,
  };
}

/** ¿El estado (efectivo) es un walkover? */
export function isWalkover(status: MatchStatus | null | undefined): boolean {
  return status === MatchStatus.WALKOVER;
}
