import type { PlannedMatch } from "./types";

/** Hueco para el equipo que descansa cuando la cantidad es impar. */
const BYE = "__BYE__";

/**
 * Round-robin (todos contra todos) por **método del círculo** (S1).
 *
 * Se fija el primer equipo y los demás rotan una posición por jornada. En cada
 * jornada se enfrentan los extremos opuestos del arreglo. Garantiza que cada
 * par se cruce exactamente una vez y que nadie juegue dos veces la misma fecha.
 *
 * - Cantidad **par**: n-1 jornadas de n/2 partidos.
 * - Cantidad **impar**: se agrega un equipo fantasma; queda en n jornadas y
 *   cada equipo descansa exactamente una (su cruce contra el fantasma se
 *   descarta, no se inventa un partido contra nadie).
 *
 * **Localía:** se invierte únicamente el cruce del equipo fijo, en las jornadas
 * impares. Suena a poco, pero es lo correcto: la rotación ya alterna sola el
 * lado de los demás, y el único que queda siempre del mismo lado es el fijo.
 * Verificado en los tests: el desbalance máximo es 1 partido (el mínimo
 * posible, porque cada equipo juega n-1 partidos, que es impar). Alternar
 * también por índice de cruce —el error intuitivo— **empeora** el reparto hasta
 * dejar a un equipo con los n-1 partidos de visitante.
 */
export function roundRobinRounds(
  teamIds: readonly string[],
  options: { homeAndAway?: boolean } = {},
): PlannedMatch[][] {
  if (teamIds.length < 2) return [];

  // Impar → equipo fantasma: el que le toca "juega" contra él y descansa
  const teams = [...teamIds];
  if (teams.length % 2 !== 0) teams.push(BYE);

  const half = teams.length / 2;
  const roundsCount = teams.length - 1;
  const rounds: PlannedMatch[][] = [];

  // El primero queda fijo y el resto rota: es lo que hace que el método cubra
  // todos los pares sin repetir.
  let rotating = teams.slice(1);

  for (let round = 0; round < roundsCount; round++) {
    const lineup = [teams[0], ...rotating];
    const matches: PlannedMatch[] = [];

    for (let i = 0; i < half; i++) {
      const a = lineup[i];
      const b = lineup[lineup.length - 1 - i];
      if (a === BYE || b === BYE) continue; // descansa: no hay partido

      // Solo el cruce del equipo fijo (i === 0) alterna de lado; el resto lo
      // resuelve la rotación (ver la nota de localía arriba).
      const swap = i === 0 && round % 2 === 1;
      matches.push({
        homeTeamId: swap ? b : a,
        awayTeamId: swap ? a : b,
        roundNumber: round + 1,
      });
    }

    rounds.push(matches);
    rotating = [rotating[rotating.length - 1], ...rotating.slice(0, -1)];
  }

  if (!options.homeAndAway) return rounds;

  // Vuelta: los mismos cruces con la localía invertida, numerando las jornadas
  // a continuación de la ida (fecha 1..n-1 ida, n..2n-2 vuelta).
  const secondLeg = rounds.map((matches, index) =>
    matches.map<PlannedMatch>((match) => ({
      homeTeamId: match.awayTeamId,
      awayTeamId: match.homeTeamId,
      roundNumber: roundsCount + index + 1,
    })),
  );

  return [...rounds, ...secondLeg];
}
