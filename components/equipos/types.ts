export interface ITeam {
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
  enabled: boolean;
  logoUrl: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  tournamentId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  players?: any[];
}
