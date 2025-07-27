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
}
