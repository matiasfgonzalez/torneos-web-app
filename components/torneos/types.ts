import { IUser } from "../noticias/types";

export interface ITorneo {
    id: string;
    name: string;
    description: string;
    category: string;
    locality: string;
    status: string;
    nextMatch: any;
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
    teams: any[]; // Equipos que participan en el torneo
    matches: any[]; // Partidos del torneo
}
