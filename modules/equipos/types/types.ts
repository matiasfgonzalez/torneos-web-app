export interface ITeam {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  organizationId: string;
  description: string | null;
  logoUrl: string | null;
  enabled: boolean;
  deletedAt: Date | null;
  shortName: string | null;
  history: string | null;
  // En el schema son `String?`: el tipo los declaraba no-nulos y mentía.
  coach: string | null;
  homeCity: string | null;
  yearFounded: number | null;
  homeColor: string | null;
  awayColor: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  players?: any[];
  /** Presente en el listado del panel: cuántos torneos jugó. 0 ⇒ es eliminable. */
  _count?: { tournamentTeams: number };
}
