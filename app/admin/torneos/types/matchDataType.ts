export interface MatchDataType {
  id: string;
  dateTime: string;
  stadium: string;
  city: string;
  description: string;
  status: string;
  homeScore: number;
  awayScore: number;
  tournamentId: string;
  homeTeamId: string;
  awayTeamId: string;
  penaltyWinnerTeamId: string;
  penaltyScoreHome: number;
  penaltyScoreAway: number;
  roundNumber: number;
  phaseId: string;
  createdAt: string;
  updatedAt: string;
  tournament: Tournament;
  homeTeam: LocationTeam;
  awayTeam: LocationTeam;
  phase: Phase;
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
  nextMatch: string;
  homeAndAway: boolean;
  enabled: boolean;
  rules: string;
  trophy: string;
  startDate: string;
  endDate: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  phaseId: string;
}

export interface LocationTeam {
  id: string;
  tournamentId: string;
  teamId: string;
  group: string;
  isEliminated: boolean;
  notes: string;
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
  team: Team;
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
  createdAt: string;
  updatedAt: string;
}

export interface Phase {
  id: string;
  name: string;
  order: number;
}
