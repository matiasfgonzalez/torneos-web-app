/**
 * Configuración deportiva por torneo (N7).
 *
 * Los puntos y el orden de desempate dejan de estar hardcodeados (3-1-0) y
 * pasan a leerse del torneo, habilitando reglas distintas por competición y,
 * a futuro, multi-deporte (S10).
 */

export interface PointsConfig {
  pointsWin: number;
  pointsDraw: number;
  pointsLoss: number;
}

export const DEFAULT_POINTS: PointsConfig = {
  pointsWin: 3,
  pointsDraw: 1,
  pointsLoss: 0,
};

/**
 * Criterios de desempate soportados por el ordenamiento de la tabla.
 * Todos son calculables desde una fila de standings (no requieren datos extra):
 * - PTS:  puntos
 * - DIF:  diferencia de gol
 * - GF:   goles a favor
 * - GA:   goles en contra (menos es mejor)
 * - WINS: partidos ganados
 *
 * H2H (head-to-head) y FairPlay requieren cruzar partidos/tarjetas y se
 * resolverán en una iteración posterior (N8 aporta las tarjetas).
 */
export const TIEBREAKER_CRITERIA = ["PTS", "DIF", "GF", "GA", "WINS"] as const;

export type TiebreakerCriterion = (typeof TIEBREAKER_CRITERIA)[number];

export const DEFAULT_TIEBREAKERS: TiebreakerCriterion[] = [
  "PTS",
  "DIF",
  "GF",
  "WINS",
];

export const TIEBREAKER_LABELS: Record<TiebreakerCriterion, string> = {
  PTS: "Puntos",
  DIF: "Diferencia de gol",
  GF: "Goles a favor",
  GA: "Menos goles en contra",
  WINS: "Partidos ganados",
};

/**
 * Normaliza el valor `tiebreakers` (Json de Prisma, puede ser null o basura)
 * a una lista válida y sin duplicados. Siempre garantiza que PTS esté primero
 * (una tabla de posiciones se ordena por puntos ante todo).
 */
export function normalizeTiebreakers(
  value: unknown,
): TiebreakerCriterion[] {
  if (!Array.isArray(value)) return DEFAULT_TIEBREAKERS;

  const valid = value.filter(
    (item): item is TiebreakerCriterion =>
      typeof item === "string" &&
      (TIEBREAKER_CRITERIA as readonly string[]).includes(item),
  );

  const deduped = Array.from(new Set(valid));
  if (deduped.length === 0) return DEFAULT_TIEBREAKERS;

  // PTS siempre lidera el orden
  const withoutPts = deduped.filter((c) => c !== "PTS");
  return ["PTS", ...withoutPts];
}

/** Fila mínima necesaria para ordenar una tabla de posiciones */
export interface StandingRow {
  points: number;
  goalDifference: number;
  goalsFor: number;
  goalsAgainst: number;
  wins: number;
}

/** Devuelve el valor de un criterio para una fila (mayor = mejor posición) */
function criterionValue(row: StandingRow, criterion: TiebreakerCriterion): number {
  switch (criterion) {
    case "PTS":
      return row.points;
    case "DIF":
      return row.goalDifference;
    case "GF":
      return row.goalsFor;
    case "GA":
      return -row.goalsAgainst; // menos en contra es mejor
    case "WINS":
      return row.wins;
  }
}

/**
 * Comparador de standings según el orden de desempate del torneo.
 * Uso: `[...teams].sort(makeStandingsComparator(tournament.tiebreakers))`.
 */
export function makeStandingsComparator<T extends StandingRow>(
  tiebreakers?: unknown,
): (a: T, b: T) => number {
  const order = normalizeTiebreakers(tiebreakers);
  return (a, b) => {
    for (const criterion of order) {
      const diff = criterionValue(b, criterion) - criterionValue(a, criterion);
      if (diff !== 0) return diff;
    }
    return 0;
  };
}
