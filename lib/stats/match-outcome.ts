import { MatchStatus } from "@prisma/client";

import type { Outcome, StatMatch } from "./types";

/**
 * ¿El partido ya se jugó, a los fines estadísticos? (S7)
 *
 * FINALIZADO o WALKOVER **con los dos marcadores cargados**. Un partido sin
 * marcador no aporta nada a una racha ni a un head-to-head; el WALKOVER ya trae
 * su marcador fijado por el server (N7), así que entra igual.
 */
export function isPlayed(match: StatMatch): boolean {
  return (
    (match.status === MatchStatus.FINALIZADO ||
      match.status === MatchStatus.WALKOVER) &&
    match.homeScore !== null &&
    match.awayScore !== null
  );
}

/**
 * Resultado del partido para un equipo (W/D/L), o null si no jugó o el equipo
 * no participó.
 *
 * **Se decide por el marcador, igual que la tabla de posiciones**
 * (`calculateTeamStats` en lib/standings): es la misma fuente de verdad, así la
 * racha nunca contradice a la tabla. Consecuencia deliberada: una serie que se
 * definió por penales (marcador empatado + `penaltyWinner`) cuenta como
 * **empate** acá, exactamente como la cuenta la tabla general.
 */
export function teamOutcome(
  match: StatMatch,
  tournamentTeamId: string,
): Outcome | null {
  if (!isPlayed(match)) return null;

  const isHome = match.homeTeamId === tournamentTeamId;
  const isAway = match.awayTeamId === tournamentTeamId;
  if (!isHome && !isAway) return null;

  const own = (isHome ? match.homeScore : match.awayScore) as number;
  const rival = (isHome ? match.awayScore : match.homeScore) as number;

  if (own > rival) return "W";
  if (own < rival) return "L";
  return "D";
}
