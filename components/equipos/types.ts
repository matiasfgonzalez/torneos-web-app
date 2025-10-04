export interface ITeam {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string | null;
  description: string | null;
  logoUrl: string | null;
  enabled: boolean;
  deletedAt: Date | null;
  shortName: string | null;
  history: string | null;
  coach: string;
  homeCity: string;
  yearFounded: string | null;
  homeColor: string;
  awayColor: string;
}
