import type { PlannedMatch } from "./types";

/** Nombre de la ronda según cuántos equipos entran a ella. */
export function knockoutRoundName(slots: number): string {
  const names: Record<number, string> = {
    2: "Final",
    4: "Semifinal",
    8: "Cuartos de final",
    16: "Octavos de final",
    32: "Dieciseisavos de final",
  };
  return names[slots] ?? `Ronda de ${slots}`;
}

/** Potencia de 2 igual o mayor. 6 equipos → cuadro de 8. */
export function bracketSize(teamCount: number): number {
  let size = 1;
  while (size < teamCount) size *= 2;
  return size;
}

/**
 * Orden de siembra estándar de un cuadro (S1).
 *
 * Devuelve las posiciones del cuadro de forma que el 1 y el 2 solo se crucen en
 * la final, el 1 y el 4 en semis, etc. Para 8: [1,8,4,5,2,7,3,6].
 *
 * Sin esto, sembrar 1v2, 3v4… elimina a los dos mejores en primera ronda, que
 * es exactamente lo que un cuadro sembrado existe para evitar.
 */
export function seedOrder(size: number): number[] {
  let order = [1, 2];
  while (order.length < size) {
    const round = order.length * 2 + 1;
    const next: number[] = [];
    for (const seed of order) {
      next.push(seed, round - seed);
    }
    order = next;
  }
  return order;
}

export interface KnockoutFirstRound {
  matches: PlannedMatch[];
  /** Equipos que pasan a la ronda siguiente sin jugar. */
  byes: string[];
  /** Nombre de la ronda que se genera ("Cuartos de final"…). */
  roundName: string;
}

/**
 * Primera ronda de un cuadro de eliminación directa, con byes (S1).
 *
 * ⚠️ **Genera solo la primera ronda, a propósito.** `Match.homeTeamId` es
 * obligatorio en el schema, así que no se puede crear una semifinal antes de
 * saber quién la juega: no hay forma de representar "el ganador de la llave 3".
 * Las rondas siguientes se cargan cuando hay resultados (con el formulario de
 * partido que ya existe).
 *
 * Los byes salen de la siembra: en un cuadro de 8 con 6 equipos, los sembrados
 * 1 y 2 pasan directo — es el reparto correcto, premia al mejor sembrado en vez
 * de sortear quién zafa.
 */
export function knockoutFirstRound(
  teamIds: readonly string[],
): KnockoutFirstRound {
  if (teamIds.length < 2) {
    return { matches: [], byes: [...teamIds], roundName: "Final" };
  }

  const size = bracketSize(teamIds.length);
  const order = seedOrder(size);

  // Posición de siembra → equipo, o null si es un hueco (bye)
  const slots = order.map((seed) => teamIds[seed - 1] ?? null);

  const matches: PlannedMatch[] = [];
  const byes: string[] = [];

  for (let i = 0; i < slots.length; i += 2) {
    const home = slots[i];
    const away = slots[i + 1];

    if (home && away) {
      matches.push({
        homeTeamId: home,
        awayTeamId: away,
        roundNumber: 1,
      });
    } else if (home || away) {
      // Un solo equipo en la llave: pasa sin jugar
      byes.push((home ?? away) as string);
    }
  }

  return {
    matches,
    byes,
    // La ronda se nombra por los equipos que entran de verdad, no por el tamaño
    // del cuadro: 6 equipos en cuadro de 8 son "Cuartos", aunque se jueguen 2.
    roundName: knockoutRoundName(size),
  };
}
