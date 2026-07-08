/**
 * Reglas puras de sanciones automáticas (N8).
 *
 * Separadas de la capa de BD para poder testearlas sin base de datos.
 * El motor (engine.ts) las usa para reconciliar las suspensiones de un torneo
 * de forma idempotente: recalcular no debe duplicar ni perder estado.
 */

export const DEFAULT_YELLOWS_FOR_SUSPENSION = 5;
export const DEFAULT_MATCHES_PER_RED_CARD = 1;

/** Tarjeta mínima para el cálculo (una fila de Card + fecha de su partido) */
export interface CardInput {
  id: string;
  matchId: string;
  type: "AMARILLA" | "ROJA";
  matchDate: Date;
  /** desempate estable cuando dos tarjetas comparten fecha de partido */
  createdAt: Date;
}

/** Suspensión automática que el motor debe garantizar que exista */
export interface DesiredSuspension {
  reason: "ACUMULACION" | "ROJA";
  totalMatches: number;
  triggerDate: Date;
  /** clave de dedupe: sourceCardId para ROJA, accumulationIndex para ACUMULACION */
  sourceCardId?: string;
  accumulationIndex?: number;
}

/**
 * Amarillas que cuentan para la acumulación: se excluyen las de un partido
 * donde el jugador además vio roja (esa fecha ya se castiga con la roja;
 * evita el triple castigo de la doble amarilla). Ordenadas cronológicamente.
 */
export function accumulationYellows(cards: CardInput[]): CardInput[] {
  const matchesWithRed = new Set(
    cards.filter((c) => c.type === "ROJA").map((c) => c.matchId),
  );
  return cards
    .filter((c) => c.type === "AMARILLA" && !matchesWithRed.has(c.matchId))
    .sort(sortByMatchThenCreated);
}

function sortByMatchThenCreated(a: CardInput, b: CardInput): number {
  const byMatch = a.matchDate.getTime() - b.matchDate.getTime();
  if (byMatch !== 0) return byMatch;
  return a.createdAt.getTime() - b.createdAt.getTime();
}

/**
 * Calcula las suspensiones automáticas que corresponden a las tarjetas de UN
 * jugador según la configuración del torneo. Idempotente: mismas tarjetas →
 * mismo resultado (mismas claves de dedupe).
 */
export function computeDesiredSuspensions(
  cards: CardInput[],
  config: { yellowsForSuspension: number; matchesPerRedCard: number },
): DesiredSuspension[] {
  const desired: DesiredSuspension[] = [];

  // 1. Una suspensión por cada roja (directa o doble amarilla)
  if (config.matchesPerRedCard > 0) {
    for (const red of cards.filter((c) => c.type === "ROJA")) {
      desired.push({
        reason: "ROJA",
        totalMatches: config.matchesPerRedCard,
        triggerDate: red.matchDate,
        sourceCardId: red.id,
      });
    }
  }

  // 2. Una suspensión de 1 fecha por cada múltiplo de amarillas acumuladas
  if (config.yellowsForSuspension > 0) {
    const yellows = accumulationYellows(cards);
    const thresholds = Math.floor(
      yellows.length / config.yellowsForSuspension,
    );
    for (let k = 1; k <= thresholds; k++) {
      const triggerCard = yellows[k * config.yellowsForSuspension - 1];
      desired.push({
        reason: "ACUMULACION",
        totalMatches: 1,
        triggerDate: triggerCard.matchDate,
        accumulationIndex: k,
      });
    }
  }

  return desired;
}

/**
 * Fechas ya cumplidas de una suspensión: partidos FINALIZADOS del equipo
 * posteriores a la fecha del evento que la originó, tope en totalMatches.
 */
export function computeServed(
  triggerDate: Date,
  finalizedTeamMatchDates: Date[],
  totalMatches: number,
): { servedMatches: number; isActive: boolean } {
  const after = finalizedTeamMatchDates.filter(
    (d) => d.getTime() > triggerDate.getTime(),
  ).length;
  const servedMatches = Math.min(after, totalMatches);
  return { servedMatches, isActive: servedMatches < totalMatches };
}
