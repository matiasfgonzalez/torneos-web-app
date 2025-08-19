import { ITeam } from "../equipos/types";

export interface IPlayer {
  id: string;
  name: string;
  birthDate: string | Date;
  birthPlace: string | Date;
  nationality: string;
  height: number;
  weight: number;
  dominantFoot: string;
  position: string;
  number: number;
  imageUrl: string;
  description: string;
  bio: string;
  status: string;
  joinedAt: string | Date;
  instagramUrl: string;
  twitterUrl: string;
  teamId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  team: ITeam;
  goals: any[];
}
