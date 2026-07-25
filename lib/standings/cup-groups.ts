/**
 * Separación de la fase final por **copa** (S13).
 *
 * Un torneo puede tener varias copas conviviendo — el caso del cliente: los
 * ganadores de los cuartos van a la Copa de Oro y los perdedores a la Copa de
 * Plata, todo dentro del mismo torneo. Cada copa es un cuadro propio: dibujarlas
 * juntas mezcla dos finales distintas en la misma columna y el cuadro deja de
 * significar algo.
 *
 * El criterio es `TournamentPhase.cupName`; `null` = fase final única (un torneo
 * de eliminación simple, que es el caso normal y no cambia en nada).
 *
 * Lógica pura, sin BD ni React: se testea sola (regla del repo).
 */

import { isKnockoutPhaseType } from "./phase-utils";

/** Lo mínimo que necesita un partido para agruparse por copa. */
export interface CupGroupableMatch {
  tournamentPhase?: {
    order: number;
    type?: string | null;
    cupName?: string | null;
  } | null;
}

export interface CupGroup<M> {
  /** Nombre de la copa, o `null` si las fases no declaran ninguna. */
  cupName: string | null;
  matches: M[];
}

/**
 * Agrupa los partidos de **eliminación directa** por copa.
 *
 * - Filtra por `type === "KNOCKOUT"` (igual que el bracket: el nombre de la
 *   fase es texto libre, ver `isKnockoutPhaseType`).
 * - Los partidos sin copa caen en un grupo con `cupName: null`.
 * - Los grupos salen ordenados por la **fase más temprana** de cada copa
 *   (`order`), así "Copa de Oro" y "Copa de Plata" quedan siempre en el mismo
 *   orden que las creó el organizador; a igual orden, alfabético.
 *
 * Devuelve `[]` si no hay ningún partido de eliminación directa.
 */
export function groupMatchesByCup<M extends CupGroupableMatch>(
  matches: M[],
): CupGroup<M>[] {
  // `Map` con la clave normalizada: `null` y `""` son la misma "sin copa".
  const groups = new Map<
    string | null,
    { cupName: string | null; minOrder: number; matches: M[] }
  >();

  for (const match of matches) {
    const phase = match.tournamentPhase;
    if (!phase || !isKnockoutPhaseType(phase.type)) continue;

    const cupName = phase.cupName?.trim() ? phase.cupName.trim() : null;
    const entry = groups.get(cupName) ?? {
      cupName,
      minOrder: phase.order,
      matches: [],
    };
    entry.minOrder = Math.min(entry.minOrder, phase.order);
    entry.matches.push(match);
    groups.set(cupName, entry);
  }

  return Array.from(groups.values())
    .sort(
      (a, b) =>
        a.minOrder - b.minOrder ||
        (a.cupName ?? "").localeCompare(b.cupName ?? ""),
    )
    .map(({ cupName, matches: cupMatches }) => ({ cupName, matches: cupMatches }));
}

/** ¿Este torneo tiene más de una copa en su fase final? */
export function hasMultipleCups<M extends CupGroupableMatch>(
  matches: M[],
): boolean {
  return groupMatchesByCup(matches).length > 1;
}
