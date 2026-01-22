import { IUser } from "@modules/noticias/types";
import { ITournamentTeam } from "./tournament-teams.types";

export interface ITorneo {
  id: string;
  name: string;
  description: string;
  category: string;
  locality: string;
  status: string;
  enabled: boolean; // Si el torneo está habilitado/visible
  rules?: string | null; // Reglamento del torneo
  trophy?: string | null; // Premio/Trofeo del torneo
  nextMatch: string | Date;
  startDate: string | Date;
  endDate: string | Date;
  userId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  user: IUser;
  logoUrl?: string; // URL del logo del torneo
  format: string; // Formato del torneo (Liga, Eliminación directa, etc.)
  homeAndAway: boolean; // Si el torneo es de ida y vuelta o solo un partido
  liga: string; // Liga a la que pertenece el torneo
  tournamentTeams?: ITournamentTeam[]; // Equipos que participan en el torneo
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  matches?: any[]; // Partidos del torneo
}
