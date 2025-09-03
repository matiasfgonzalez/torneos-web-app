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

enum PlayerPosition {
  // Arquero
  ARQUERO = "ARQUERO",

  // Defensas
  DEFENSOR_CENTRAL = "DEFENSOR_CENTRAL",
  LATERAL_DERECHO = "LATERAL_DERECHO",
  LATERAL_IZQUIERDO = "LATERAL_IZQUIERDO",
  CARRILERO_DERECHO = "CARRILERO_DERECHO",
  CARRILERO_IZQUIERDO = "CARRILERO_IZQUIERDO",

  // Mediocampistas
  VOLANTE_DEFENSIVO = "VOLANTE_DEFENSIVO",
  PIVOTE = "PIVOTE",
  VOLANTE_CENTRAL = "VOLANTE_CENTRAL",
  VOLANTE_OFENSIVO = "VOLANTE_OFENSIVO",
  INTERIOR_DERECHO = "INTERIOR_DERECHO",
  INTERIOR_IZQUIERDO = "INTERIOR_IZQUIERDO",
  ENGANCHE = "ENGANCHE",

  // Delanteros
  EXTREMO_DERECHO = "EXTREMO_DERECHO",
  EXTREMO_IZQUIERDO = "EXTREMO_IZQUIERDO",
  DELANTERO_CENTRO = "DELANTERO_CENTRO",
  SEGUNDO_DELANTERO = "SEGUNDO_DELANTERO",
  FALSO_9 = "FALSO_9",
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
