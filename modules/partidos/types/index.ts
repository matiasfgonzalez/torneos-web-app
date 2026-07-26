import type { CardType, MatchStatus, PhaseType } from "@/lib/generated/prisma/enums";

export interface ITeam {
  id: string;
  name: string;
  shortName?: string;
  description?: string;
  history?: string;
  coach?: string;
  homeCity?: string;
  yearFounded?: string;
  homeColor?: string;
  awayColor?: string;
  logoUrl?: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ITournament {
  id: string;
  name: string;
  description?: string;
  category?: string;
  locality?: string;
  logoUrl?: string;
  liga?: string;
  status?: string;
  format?: string;
  homeAndAway?: boolean;
  enabled?: boolean;
  startDate?: string;
  endDate?: string;
  userId?: string;
  organizationId?: string;
  walkoverScore?: number;
  // Slugs para la URL pública canónica (tournamentPublicPath, F2)
  slug?: string | null;
  organization?: { slug: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface ITournamentTeam {
  id: string;
  tournamentId: string;
  teamId: string;
  group?: string;
  isEliminated: boolean;
  notes?: string;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  createdAt: string;
  updatedAt: string;
  team: ITeam;
}

/** Fase de un torneo (`TournamentPhase`). */
export interface IPhase {
  id: string;
  /** Texto libre: "Fase de grupos", "Cuartos de final", "Apertura". */
  name: string;
  order: number;
  /**
   * Qué clase de fase es. **Es el campo por el que hay que filtrar**, no el
   * nombre: `name` es libre y no se puede comparar contra una lista fija (era
   * el bug del bracket, que buscaba nombres del modelo `Phase` legacy).
   */
  type?: PhaseType;
  /**
   * Copa a la que pertenece la fase (S13): "Copa de Oro", "Copa de Plata"…
   * `null` = fase final única (el torneo no usa copas múltiples). Es lo que
   * separa los cuadros: dos copas en un mismo torneo son dos brackets.
   */
  cupName?: string | null;
}

export interface IGoal {
  id: string;
  minute: number; // minuto en que se marcó el gol
  playerId: string; // jugador que hizo el gol
  matchId: string; // partido al que pertenece el gol
  teamId: string; // equipo que marcó el gol (opcional si se infiere del jugador)
  isOwnGoal: boolean; // si fue un autogol
  isPenalty: boolean; // si fue un penal
  createdAt: string; // fecha de creación
  updatedAt: string; // fecha de última actualización
  teamPlayer?: {
    id: string;
    player: {
      id: string;
      name: string;
    };
    tournamentTeam?: {
      id: string;
      team: {
        id: string;
        name: string;
        logoUrl?: string;
      };
    };
  };
  /** Asistencia, si se cargó. */
  assistTeamPlayer?: {
    id: string;
    player: {
      id: string;
      name: string;
    };
  } | null;
}
// `MatchStatus` ya no se redeclara acá: se importa de `@prisma/client`, que es
// donde vive el enum de verdad. La copia local tenía los mismos valores pero TS
// trata dos enums nominales como **incompatibles**, así que asignar un partido
// de Prisma a un `IPartidos` no compilaba y la salida fue ensanchar tipos a
// `string` (ver el comentario que había en `utils/liveState.ts`). Un agujero de
// tipos para sostener un duplicado que nadie mantenía sincronizado.
//
// La lista para selects tampoco vive acá: es `MATCH_STATUS_OPTIONS` en
// `lib/constants.ts`, derivada de `MATCH_STATUS_LABELS` — las mismas etiquetas
// que muestran los badges. La copia local traía "En juego" donde el badge decía
// "En Juego".

// `CardType` se importa de `@prisma/client`. Había una copia local con los
// mismos dos valores y el repo usaba **las dos a la vez**: `lib/stats/types.ts`,
// `ManageCards` y `actions/cards.ts` la de Prisma, `ICard.type` la local — dos
// tipos que TS considera distintos describiendo la misma columna.

/** Jugador dentro de un equipo-torneo, tal como llega en goles y tarjetas. */
export interface IEventTeamPlayer {
  id: string;
  player: {
    id: string;
    name: string;
  };
  tournamentTeam?: {
    id: string;
    team: {
      id: string;
      name: string;
      logoUrl?: string;
    };
  };
}

export interface ICard {
  id: string;
  matchId: string;
  teamPlayerId: string;
  type: CardType;
  minute?: number;
  reason?: string;
  createdAt: string;
  updatedAt: string;
  teamPlayer?: IEventTeamPlayer;
}

export interface IReferee {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  certificationLevel?: string;
}

export interface IMatchReferee {
  id: string;
  matchId: string;
  refereeId: string;
  role: string;
  referee: IReferee;
}

export interface IPartidos {
  id: string;
  dateTime: string;
  stadium?: string;
  city?: string;
  description?: string;
  status: MatchStatus;
  homeScore?: number | null;
  awayScore?: number | null;
  tournamentId: string;
  homeTeamId: string;
  awayTeamId: string;
  penaltyWinnerTeamId?: string | null;
  penaltyScoreHome?: number | null;
  penaltyScoreAway?: number | null;
  walkoverWinnerTeamId?: string | null;
  roundNumber: number;
  tournamentPhaseId?: string | null;
  createdAt: string;
  updatedAt: string;
  tournament: ITournament;
  homeTeam: ITournamentTeam;
  awayTeam: ITournamentTeam;
  tournamentPhase?: IPhase | null;
  goals: IGoal[];
  cards: ICard[];
  referees: IMatchReferee[];
}

// `MatchType` (LIGA/COPA/PLAYOFF/AMISTOSO) y `MatchFilters` se eliminaron: no
// existía `Match.type` en el schema, así que el enum no describía ningún dato y
// filtrar por él nunca hizo nada. El filtro real de la lista de partidos viaja
// por query params y lo arma `GET /api/matches` (`q`, `status`, `tournamentId`).
// Si algún día hace falta marcar un amistoso, primero va la columna.
