import type { StatCard, StatTeamRef } from "./types";

/**
 * Puntos de fair play por tarjeta (S7).
 *
 * La app solo distingue AMARILLA/ROJA (no hay "segunda amarilla" como tipo
 * propio), así que se usa la escala amateur más común: **amarilla 1, roja 3**.
 * Un solo lugar para el criterio, y no una constante mágica repartida por el
 * cálculo.
 */
export const FAIR_PLAY_POINTS = { yellow: 1, red: 3 } as const;

export interface FairPlayRow {
  position: number;
  tournamentTeamId: string;
  teamId: string;
  teamName: string;
  teamLogoUrl: string | null;
  yellowCards: number;
  redCards: number;
  /** Menos = más limpio. yellow×1 + red×3. */
  points: number;
}

/**
 * Ranking de fair play por equipo (S7): el que menos puntos de tarjeta acumula
 * va primero.
 *
 * **Incluye a los equipos sin tarjetas** — son justamente los más limpios y
 * omitirlos daría un ranking al revés (el que no tiene faltas no aparecería).
 * Por eso recibe la lista de participantes, no solo las tarjetas.
 *
 * Desempate: menos puntos → menos rojas → menos amarillas → nombre (estable, no
 * depende del orden en que vinieron las filas).
 */
export function computeFairPlay(
  teams: StatTeamRef[],
  cards: StatCard[],
): FairPlayRow[] {
  const tally = new Map<string, { yellow: number; red: number }>();
  for (const team of teams) {
    tally.set(team.tournamentTeamId, { yellow: 0, red: 0 });
  }

  for (const card of cards) {
    // Una tarjeta de un equipo que no está en la lista (dato viejo/inconsistente)
    // se ignora en vez de crear una fila fantasma sin nombre.
    const entry = tally.get(card.tournamentTeamId);
    if (!entry) continue;
    if (card.type === "AMARILLA") entry.yellow += 1;
    else if (card.type === "ROJA") entry.red += 1;
  }

  return teams
    .map((team) => {
      const { yellow, red } = tally.get(team.tournamentTeamId)!;
      return {
        tournamentTeamId: team.tournamentTeamId,
        teamId: team.teamId,
        teamName: team.teamName,
        teamLogoUrl: team.teamLogoUrl,
        yellowCards: yellow,
        redCards: red,
        points: yellow * FAIR_PLAY_POINTS.yellow + red * FAIR_PLAY_POINTS.red,
      };
    })
    .sort(
      (a, b) =>
        a.points - b.points ||
        a.redCards - b.redCards ||
        a.yellowCards - b.yellowCards ||
        a.teamName.localeCompare(b.teamName),
    )
    .map((row, index) => ({ position: index + 1, ...row }));
}
