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

export enum MatchType {
  LIGA = "LIGA",
  COPA = "COPA",
  PLAYOFF = "PLAYOFF",
  AMISTOSO = "AMISTOSO",
}

export interface Team {
  id: string;
  name: string;
  logo: string;
  shortName: string;
}

export interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  homeScore?: number;
  awayScore?: number;
  status: MatchStatus;
  type: MatchType;
  date: Date;
  venue: string;
  tournamentId: string;
  tournamentName: string;
  round?: string;
  referee?: string;
  attendance?: number;
  weather?: string;
  temperature?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MatchFilters {
  status?: MatchStatus | string;
  type?: MatchType | string;
  tournamentId?: string;
  teamId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

export interface PaginatedMatches {
  matches: Match[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

