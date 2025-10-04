import { IPlayerTeam } from "../jugadores/types";
import { IGoal, IPhase } from "../partidos/types";

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

  // Relaciones
  team: Team;
  tournament: Tournament;
  teamPlayer?: IPlayerTeam[];

  // Relaciones inversas
  homeMatches?: IMatch[];
  awayMatches?: IMatch[];
  penaltyWins?: IMatch[];
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  description: string;
  history: string;
  coach: string;
  homeCity: string;
  yearFounded: string;
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
  category: string;
  locality: string;
  logoUrl: string;
  liga: string;
  status: string;
  format: string;
  nextMatch: string | Date;
  homeAndAway: boolean;
  enabled: boolean;
  startDate: string | Date;
  endDate: string | Date;
  userId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export enum MatchStatus {
  PROGRAMADO = "PROGRAMADO", // Programado
  EN_JUEGO = "EN_JUEGO", // En curso
  ENTRETIEMPO = "ENTRETIEMPO", // Pausa entre tiempos
  FINALIZADO = "FINALIZADO", // Terminado
  SUSPENDIDO = "SUSPENDIDO", // Suspendido temporalmente (clima, incidentes, etc.)
  POSTERGADO = "POSTERGADO", // Reprogramado para otra fecha
  CANCELADO = "CANCELADO", // Anulado, no se jugará
  WALKOVER = "WALKOVER",
}

export interface IMatch {
  id: string;
  dateTime: string | Date;
  stadium?: string;
  city?: string;
  description?: string;
  status: MatchStatus; // Debe coincidir con tu enum

  homeScore?: number;
  awayScore?: number;

  tournamentId: string;
  tournament?: Tournament;

  homeTeamId: string;
  homeTeam?: ITournamentTeam;

  awayTeamId: string;
  awayTeam?: ITournamentTeam;

  goals?: IGoal[]; // Asume que tienes una interfaz Goal

  penaltyWinnerTeamId?: string;
  penaltyWinnerTeam?: ITournamentTeam;

  penaltyScoreHome?: number;
  penaltyScoreAway?: number;

  roundNumber?: number;

  phaseId?: string;
  phase?: IPhase;

  createdAt: string | Date;
  updatedAt: string | Date;
}
