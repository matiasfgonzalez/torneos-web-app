import { ITeam } from "@modules/equipos/types/types";

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
  /** DNI — identidad global del jugador (N12). Obligatorio y único en toda la
      plataforma: es lo que evita cargar dos veces a la misma persona. */
  nationalId: string;
  birthDate: string | Date;
  birthPlace: string;
  nationality: string;
  height: number;
  weight: number;
  dominantFoot: "IZQUIERDA" | "DERECHA" | "AMBOS";
  position: string;
  number: number;
  imageUrl: string;
  imagePublicId?: string;
  imageUrlFace: string;
  imageFacePublicId?: string;
  description: string;
  bio: string;
  status: string;
  /** Baja lógica: sigue visible con todo su historial, pero no se puede sumar a un equipo. */
  enabled: boolean;
  joinedAt: string | Date;
  instagramUrl: string;
  twitterUrl: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  team?: ITeam;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  goals?: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  teamPlayer?: any[];
  /** Presente en el listado del panel: en cuántos equipos-torneo jugó. 0 ⇒ es eliminable. */
  _count?: { teamPlayer: number };
}

// Acá vivían `Foot`, `PlayerStatus` y las listas `PLAYER_FOOT`/`PLAYER_STATUS`/
// `PLAYER_POSITION` escritas a mano (más un `PlayerStatusOld` comentado desde
// hacía tiempo). Todo duplicaba enums de Prisma y sus listas ya derivadas en
// `lib/constants.ts` (`FOOT_OPTIONS`, `PLAYER_STATUS_OPTIONS`,
// `PLAYER_POSITION_OPTIONS`), y no lo usaba nadie: el repo entero importa de
// `@prisma/client` y de `lib/constants`. Se borró.
