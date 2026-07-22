import { knockoutFirstRound, type KnockoutFirstRound } from "./knockout";

/**
 * Copas y fases finales dentro de un mismo torneo (S13).
 *
 * El caso que lo motivó: una liga de todos contra todos donde, terminada la
 * fase regular, los primeros 8 juegan cuartos, **los ganadores pasan a la
 * Copa de Oro y los perdedores a la Copa de Plata**, y cada copa juega su
 * semifinal, su final y su tercer puesto. Y una variante: con 20 equipos,
 * repartir 1-8 a Oro, 9-16 a Plata y 17-20 a Bronce.
 *
 * Son dos mecanismos distintos y el modelo necesita los dos:
 *
 * - **`STANDINGS`** — los equipos salen de un tramo de la tabla (`1..8`,
 *   `9..16`, `17..20`). La copa se decide por **posición**.
 * - **`WINNERS` / `LOSERS`** — los equipos salen de lo que pasó en otra fase.
 *   La copa se decide por **resultado**. Es también lo que le faltaba a
 *   `DOBLE_ELIMINACION` (ver `formats.ts`: "necesita un cuadro de perdedores,
 *   que el modelo de fases todavía no representa").
 *
 * Todo acá es puro: recibe ids ya ordenados y devuelve un plan. Quién puede
 * generarlo, si la fase de origen terminó y la escritura son del server action.
 */

export type CupSeedSource = "STANDINGS" | "WINNERS" | "LOSERS";

/** Un cruce ya jugado de la fase de origen. */
export interface RoundMatchResult {
  homeTeamId: string;
  awayTeamId: string;
  /**
   * Ganador ya resuelto por el server (contempla penales y walkover). `null`
   * = todavía sin definir; una ronda con algún `null` no se puede propagar.
   */
  winnerTeamId: string | null;
}

export class CupSeedError extends Error {}

/**
 * Tramo `[from..to]` de la tabla, **1-based e inclusive** (`1..8` son ocho
 * equipos). Se recorta al largo real: pedir `17..20` en un torneo de 18 devuelve
 * los dos que hay en vez de fallar, porque un torneo puede quedar con menos
 * equipos de los previstos (bajas, descalificaciones) y eso no debería trabar
 * la fase final.
 */
export function teamsFromStandings(
  standings: readonly string[],
  from: number,
  to: number,
): string[] {
  if (!Number.isInteger(from) || !Number.isInteger(to) || from < 1 || to < from) {
    throw new CupSeedError(
      "El rango de posiciones no es válido: revisá que sean números enteros y que el desde no sea mayor que el hasta.",
    );
  }
  return standings.slice(from - 1, to);
}

/**
 * Ganadores o perdedores de una ronda, **en el orden de los cruces**.
 *
 * El orden importa y no es un detalle: `knockoutFirstRound` ya devolvió los
 * cruces en orden de cuadro (`1v8, 4v5, 2v7, 3v6`), así que emparejar los
 * ganadores de a dos —el del cruce 0 con el del 1, el del 2 con el del 3—
 * reproduce el cuadro clásico, donde el 1 y el 2 solo se cruzan en la final.
 * Si acá se volviera a sembrar por tabla, se rompería esa estructura.
 */
export function teamsFromRound(
  results: readonly RoundMatchResult[],
  pick: "WINNERS" | "LOSERS",
): string[] {
  const pendientes = results.filter((m) => !m.winnerTeamId);
  if (pendientes.length > 0) {
    throw new CupSeedError(
      `Faltan resultados: ${pendientes.length} ${
        pendientes.length === 1 ? "partido sigue" : "partidos siguen"
      } sin definir. Cargalos antes de generar la fase siguiente.`,
    );
  }

  return results.map((m) => {
    const ganador = m.winnerTeamId as string;
    if (pick === "WINNERS") return ganador;
    // El perdedor es el otro lado del cruce.
    return ganador === m.homeTeamId ? m.awayTeamId : m.homeTeamId;
  });
}

export interface CupRoundPlan extends KnockoutFirstRound {
  /** Equipos que entran a la ronda, ya ordenados. */
  teamIds: string[];
}

/**
 * Arma la primera ronda de una copa.
 *
 * - `STANDINGS` → se siembra con el cuadro estándar (`1v8, 4v5, 2v7, 3v6`), que
 *   es exactamente el emparejamiento que pidió el cliente.
 * - `WINNERS`/`LOSERS` → **no** se vuelve a sembrar: los equipos ya vienen en
 *   orden de cuadro y se emparejan de a dos como salen.
 */
export function planCupRound(input: {
  source: CupSeedSource;
  /** Tabla de la fase de origen (solo para `STANDINGS`). */
  standings?: readonly string[];
  /** Cruces de la fase de origen (solo para `WINNERS`/`LOSERS`). */
  results?: readonly RoundMatchResult[];
  from?: number;
  to?: number;
}): CupRoundPlan {
  let teamIds: string[];

  if (input.source === "STANDINGS") {
    if (!input.standings) {
      throw new CupSeedError("Falta la tabla de posiciones de la fase de origen.");
    }
    if (input.from == null || input.to == null) {
      throw new CupSeedError("Indicá desde y hasta qué posición entra a esta copa.");
    }
    teamIds = teamsFromStandings(input.standings, input.from, input.to);
  } else {
    if (!input.results) {
      throw new CupSeedError("Falta la ronda de origen para tomar sus resultados.");
    }
    teamIds = teamsFromRound(input.results, input.source);
  }

  if (teamIds.length < 2) {
    throw new CupSeedError(
      "Hacen falta al menos 2 equipos para armar una llave. Revisá el rango de posiciones.",
    );
  }

  // `STANDINGS` viene ordenado por tabla → se siembra. `WINNERS`/`LOSERS` ya
  // viene en orden de cuadro → se empareja tal cual, sin re-sembrar.
  const plan =
    input.source === "STANDINGS"
      ? knockoutFirstRound(teamIds)
      : pairInOrder(teamIds);

  return { ...plan, teamIds };
}

/**
 * Empareja de a dos respetando el orden recibido (0v1, 2v3, …). Si sobra uno
 * impar, pasa sin jugar.
 */
function pairInOrder(teamIds: readonly string[]): KnockoutFirstRound {
  const matches = [];
  const byes: string[] = [];

  for (let i = 0; i < teamIds.length; i += 2) {
    const home = teamIds[i];
    const away = teamIds[i + 1];
    if (home && away) {
      matches.push({ homeTeamId: home, awayTeamId: away, roundNumber: 1 });
    } else if (home) {
      byes.push(home);
    }
  }

  return { matches, byes, roundName: roundNameForTeams(teamIds.length) };
}

/**
 * Nombre de la ronda por cantidad de equipos que entran. Se usa cuando los
 * equipos vienen de otra ronda, donde no hay cuadro previo del cual deducirlo.
 */
export function roundNameForTeams(count: number): string {
  const nombres: Record<number, string> = {
    2: "Final",
    4: "Semifinal",
    8: "Cuartos de final",
    16: "Octavos de final",
  };
  return nombres[count] ?? `Ronda de ${count}`;
}
