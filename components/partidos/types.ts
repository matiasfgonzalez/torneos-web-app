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
  nextMatch?: string;
  homeAndAway?: boolean;
  enabled?: boolean;
  startDate?: string;
  endDate?: string;
  userId?: string;
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

export interface IPhase {
  id: string;
  name: string;
  order: number;
}

export interface IGoal {
  id: string;
  minute: number; // minuto en que se marcó el gol
  playerId: string; // jugador que hizo el gol
  matchId: string; // partido al que pertenece el gol
  teamId: string; // equipo que marcó el gol
  ownGoal?: boolean; // si fue un autogol
  createdAt: string; // fecha de creación
  updatedAt: string; // fecha de última actualización
}
export enum MatchStatus {
  PROGRAMADO = "PROGRAMADO",
  EN_JUEGO = "EN_JUEGO",
  ENTRETIEMPO = "ENTRETIEMPO",
  FINALIZADO = "FINALIZADO",
  SUSPENDIDO = "SUSPENDIDO",
  POSTERGADO = "POSTERGADO",
  CANCELADO = "CANCELADO",
  WALKOVER = "WALKOVER",
}

export const MATCH_STATUS = [
  { label: "Programado", value: MatchStatus.PROGRAMADO },
  { label: "En juego", value: MatchStatus.EN_JUEGO },
  { label: "Entretiempo", value: MatchStatus.ENTRETIEMPO },
  { label: "Finalizado", value: MatchStatus.FINALIZADO },
  { label: "Suspendido", value: MatchStatus.SUSPENDIDO },
  { label: "Postergado", value: MatchStatus.POSTERGADO },
  { label: "Cancelado", value: MatchStatus.CANCELADO },
  { label: "Walkover", value: MatchStatus.WALKOVER },
] as const;

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
  roundNumber: number;
  phaseId: string;
  createdAt: string;
  updatedAt: string;
  tournament: ITournament;
  homeTeam: ITournamentTeam;
  awayTeam: ITournamentTeam;
  phase: IPhase;
  goals: IGoal[];
}
