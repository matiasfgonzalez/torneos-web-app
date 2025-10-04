// ✅ Aquí pon tus enums, interfaces, etc.

export enum Foot {
  IZQUIERDA = "IZQUIERDA",
  DERECHA = "DERECHA",
  AMBOS = "AMBOS",
}

export enum PlayerStatus {
  ACTIVO = "ACTIVO",
  LESIONADO = "LESIONADO",
  SUSPENDIDO = "SUSPENDIDO",
  NO_DISPONIBLE = "NO_DISPONIBLE",
}

export interface TeamPlayer {
  id: string;
  teamId: string;
  playerId: string;
  joinedAt?: Date;
  leftAt?: Date;
  number?: number;
  position?: string;
  team: {
    id: string;
    name: string;
    logo?: string;
    country?: string;
    league?: string;
    colors: {
      primary: string;
      secondary: string;
    };
  };
}

export interface Player {
  id: string;
  name: string;
  birthDate?: Date;
  birthPlace?: string;
  nationality?: string;
  height?: number;
  weight?: number;
  dominantFoot: string;
  position?: string;
  number?: number;
  imageUrl?: string;
  imageUrlFace?: string;
  description?: string;
  bio?: string;
  status: PlayerStatus;
  joinedAt?: Date;
  instagramUrl?: string;
  twitterUrl?: string;
  teamPlayer?: TeamPlayer[];
  createdAt: Date;
  updatedAt: Date;
}
// ...tus interfaces también
