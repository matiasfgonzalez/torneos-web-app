import type { MatchStatus } from "@/lib/generated/prisma/enums";

import { IPlayerTeam } from "@modules/jugadores/types";
import { IGoal, IPhase, ICard, IMatchReferee } from "@modules/partidos/types";

export interface ITournamentTeam {
  id: string;
  tournamentId: string;
  teamId: string;
  group?: string;
  isEliminated?: boolean;
  notes?: string;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  createdAt: string | Date;
  updatedAt: string | Date;

  // Relaciones (opcionales porque no siempre se incluyen en queries)
  team?: Team;
  tournament?: Tournament;
  teamPlayer?: IPlayerTeam[];

  // Relaciones inversas
  homeMatches?: IMatch[];
  awayMatches?: IMatch[];
  penaltyWins?: IMatch[];
  phaseStats?: ITeamPhaseStats[];
}

export interface ITeamPhaseStats {
  id: string;
  tournamentTeamId: string;
  tournamentPhaseId: string;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  phase?: {
    id: string;
    description: string;
  };
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  description: string;
  history: string;
  coach: string;
  homeCity: string;
  yearFounded: number | null;
  homeColor: string;
  awayColor: string;
  logoUrl: string;
  enabled: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Tournament {
  id: string;
  name: string;
  description: string;
  // Categoría en 3 campos (M13)
  ageGroup: string;
  gender: string;
  division?: string | null;
  locality: string;
  logoUrl: string;
  liga: string;
  status: string;
  format: string;
  homeAndAway: boolean;
  enabled: boolean;
  startDate: string | Date;
  endDate: string | Date;
  organizationId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// `MatchStatus` se importa de `@prisma/client`: acá había una tercera copia del
// mismo enum, con los mismos valores y comentarios propios. Nada la obligaba a
// seguir al schema, y TS trataba las copias como tipos distintos.

export interface IMatch {
  id: string;
  dateTime: string | Date;
  stadium?: string;
  city?: string;
  description?: string;
  status: MatchStatus; // el de Prisma: ya no hay "el otro enum" con el que coincidir

  homeScore?: number;
  awayScore?: number;

  tournamentId: string;
  tournament?: Tournament;

  homeTeamId: string;
  homeTeam?: ITournamentTeam;

  awayTeamId: string;
  awayTeam?: ITournamentTeam;

  goals?: IGoal[]; // Asume que tienes una interfaz Goal
  cards?: ICard[]; // Tarjetas del partido
  referees?: IMatchReferee[]; // Árbitros del partido

  penaltyWinnerTeamId?: string;
  penaltyWinnerTeam?: ITournamentTeam;

  penaltyScoreHome?: number;
  penaltyScoreAway?: number;

  roundNumber?: number;

  /**
   * Fase del partido. Se llamaba `phase`/`phaseId` y apuntaba al modelo `Phase`
   * legacy, **borrado en A6**: la query (`getTorneoById`) trae `tournamentPhase`
   * y nunca `phase`, así que el campo viejo era siempre `undefined` y con él se
   * cayó en silencio todo el display de fases (bracket, badges, detección de
   * llaves). Ver S1 en TODO.md.
   */
  tournamentPhaseId?: string | null;
  tournamentPhase?: IPhase | null;

  createdAt: string | Date;
  updatedAt: string | Date;
}
