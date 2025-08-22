export interface ITournamentTeam {
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
  createdAt: string | Date;
  updatedAt: string | Date;
  team: Team;
  tournament: Tournament;
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
