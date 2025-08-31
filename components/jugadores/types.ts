import { ITeam } from "../equipos/types";

export interface IPlayer {
  id: string;
  name: string;
  birthDate: string | Date;
  birthPlace: string;
  nationality: string;
  height: number;
  weight: number;
  dominantFoot: "IZQUIERDA" | "DERECHA" | "AMBOS";
  position: string;
  number: number;
  imageUrl: string;
  imageUrlFace: string;
  description: string;
  bio: string;
  status: string;
  joinedAt: string | Date;
  instagramUrl: string;
  twitterUrl: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  team: ITeam;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  goals: any[];
}
