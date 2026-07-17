import type { CardType, MatchStatus } from "@prisma/client";

/**
 * Estadísticas avanzadas del torneo (S7) — capa pura.
 *
 * Todo lo de esta carpeta recibe datos planos y devuelve rankings: no toca
 * Prisma, ni `Date.now()`, ni auth. Es el mismo patrón que `lib/fixture` y
 * `lib/standings` — así se testea con arrays y sin base de datos, que es donde
 * se esconden los errores de conteo.
 *
 * **Un equipo se identifica por su `TournamentTeam` id**, no por el `Team`: es
 * el id que traen los partidos (`homeTeamId`/`awayTeamId`). El nombre y el logo
 * viajan al lado para la UI, pero la clave de agrupación siempre es esa.
 */

/** Referencia de un equipo participante (TournamentTeam + datos de UI). */
export interface StatTeamRef {
  tournamentTeamId: string;
  teamId: string;
  teamName: string;
  teamLogoUrl: string | null;
}

/** Partido en la forma mínima que necesitan forma y head-to-head. */
export interface StatMatch {
  homeTeamId: string; // TournamentTeam id
  awayTeamId: string; // TournamentTeam id
  homeScore: number | null;
  awayScore: number | null;
  status: MatchStatus;
  dateTime: Date | string;
}

/** Tarjeta en la forma mínima que necesita el fair play. */
export interface StatCard {
  tournamentTeamId: string;
  type: CardType;
}

/** Resultado de un partido desde la óptica de un equipo. */
export type Outcome = "W" | "D" | "L";
