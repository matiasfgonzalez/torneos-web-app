import type { StatMatch } from "./types";
import { isPlayed } from "./match-outcome";

export interface H2HMatch {
  dateTime: string;
  /** Marcador desde la óptica del equipo A (el primero que se pasó). */
  aScore: number;
  bScore: number;
  /** Resultado para A. */
  result: "A" | "B" | "D";
}

export interface HeadToHead {
  played: number;
  aWins: number;
  draws: number;
  bWins: number;
  aGoals: number;
  bGoals: number;
  /** Del más reciente al más viejo (lo que un hincha quiere ver primero). */
  matches: H2HMatch[];
}

/**
 * Historial entre dos equipos de un torneo (S7).
 *
 * Todo se reporta **desde la óptica de A** (el primer id): así la UI no tiene
 * que dar vuelta marcadores según quién jugó de local. Cuenta solo los partidos
 * jugados entre esos dos; el orden de localía no importa para el agregado.
 *
 * Puro: recibe los partidos ya filtrados del torneo y no sabe de dónde salieron.
 */
export function computeHeadToHead(
  aTeamId: string,
  bTeamId: string,
  matches: StatMatch[],
): HeadToHead {
  const between = matches.filter(
    (m) =>
      isPlayed(m) &&
      ((m.homeTeamId === aTeamId && m.awayTeamId === bTeamId) ||
        (m.homeTeamId === bTeamId && m.awayTeamId === aTeamId)),
  );

  const acc: HeadToHead = {
    played: 0,
    aWins: 0,
    draws: 0,
    bWins: 0,
    aGoals: 0,
    bGoals: 0,
    matches: [],
  };

  for (const m of between) {
    const aIsHome = m.homeTeamId === aTeamId;
    const aScore = (aIsHome ? m.homeScore : m.awayScore) as number;
    const bScore = (aIsHome ? m.awayScore : m.homeScore) as number;

    acc.played += 1;
    acc.aGoals += aScore;
    acc.bGoals += bScore;

    let result: H2HMatch["result"];
    if (aScore > bScore) {
      acc.aWins += 1;
      result = "A";
    } else if (aScore < bScore) {
      acc.bWins += 1;
      result = "B";
    } else {
      acc.draws += 1;
      result = "D";
    }

    acc.matches.push({
      dateTime:
        m.dateTime instanceof Date ? m.dateTime.toISOString() : m.dateTime,
      aScore,
      bScore,
      result,
    });
  }

  // Más reciente primero.
  acc.matches.sort(
    (x, y) => new Date(y.dateTime).getTime() - new Date(x.dateTime).getTime(),
  );

  return acc;
}
