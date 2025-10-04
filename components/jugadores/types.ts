import { ITeam } from "../equipos/types";

export interface IPlayerTeam {
  id: string;
  tournamentTeamId: string;
  playerId: string;
  joinedAt: string;
  leftAt: string | null;
  position: string;
  number: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  player: IPlayer;
}

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

export enum Foot {
  IZQUIERDA = "IZQUIERDA",
  DERECHA = "DERECHA",
  AMBOS = "AMBOS",
}

export const PLAYER_FOOT = [
  { label: "IZQUIERDA", value: "IZQUIERDA" },
  { label: "DERECHA", value: "DERECHA" },
  { label: "AMBOS", value: "AMBOS" },
] as const;

export const PLAYER_STATUS = [
  { label: "ACTIVO", value: "ACTIVO" },
  { label: "LESIONADO", value: "LESIONADO" },
  { label: "SUSPENDIDO", value: "SUSPENDIDO" },
  { label: "NO_DISPONIBLE", value: "NO_DISPONIBLE" },
  { label: "RETIRADO", value: "RETIRADO" },
  { label: "TRANSFERIDO", value: "TRANSFERIDO" },
  { label: "PRUEBA", value: "PRUEBA" },
  { label: "EXPULSADO", value: "EXPULSADO" },
] as const;

export enum PlayerStatus {
  ACTIVO = "ACTIVO",
  LESIONADO = "LESIONADO",
  SUSPENDIDO = "SUSPENDIDO",
  NO_DISPONIBLE = "NO_DISPONIBLE",
  RETIRADO = "RETIRADO",
  TRANSFERIDO = "TRANSFERIDO",
  PRUEBA = "PRUEBA",
  EXPULSADO = "EXPULSADO",
}

export const PLAYER_POSITION = [
  { label: "ARQUERO", value: "ARQUERO" },
  { label: "DEFENSOR_CENTRAL", value: "DEFENSOR_CENTRAL" },
  { label: "LATERAL_DERECHO", value: "LATERAL_DERECHO" },
  { label: "LATERAL_IZQUIERDO", value: "LATERAL_IZQUIERDO" },
  { label: "CARRILERO_DERECHO", value: "CARRILERO_DERECHO" },
  { label: "CARRILERO_IZQUIERDO", value: "CARRILERO_IZQUIERDO" },
  { label: "VOLANTE_DEFENSIVO", value: "VOLANTE_DEFENSIVO" },
  { label: "PIVOTE", value: "PIVOTE" },
  { label: "VOLANTE_CENTRAL", value: "VOLANTE_CENTRAL" },
  { label: "VOLANTE_OFENSIVO", value: "VOLANTE_OFENSIVO" },
  { label: "INTERIOR_DERECHO", value: "INTERIOR_DERECHO" },
  { label: "INTERIOR_IZQUIERDO", value: "INTERIOR_IZQUIERDO" },
  { label: "ENGANCHE", value: "ENGANCHE" },
  { label: "EXTREMO_DERECHO", value: "EXTREMO_DERECHO" },
  { label: "EXTREMO_IZQUIERDO", value: "EXTREMO_IZQUIERDO" },
  { label: "DELANTERO_CENTRO", value: "DELANTERO_CENTRO" },
  { label: "SEGUNDO_DELANTERO", value: "SEGUNDO_DELANTERO" },
  { label: "FALSO_9", value: "FALSO_9" },
] as const;
