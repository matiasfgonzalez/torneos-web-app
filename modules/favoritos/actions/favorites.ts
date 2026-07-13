"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { checkUser } from "@/lib/checkUser";
import type { TournamentStatus } from "@prisma/client";

export interface FavoriteTournamentItem {
  id: string;
  name: string;
  logoUrl: string | null;
  locality: string;
  status: TournamentStatus;
}

export interface FavoriteTeamItem {
  id: string;
  name: string;
  logoUrl: string | null;
  homeCity: string | null;
}

export interface UserFavorites {
  tournaments: FavoriteTournamentItem[];
  teams: FavoriteTeamItem[];
}

type ToggleResult =
  | { success: true; favorited: boolean }
  | { success: false; error: string };

/**
 * Torneos/equipos que sigue el usuario actual (N10). Devuelve listas vacías
 * si no hay sesión — se usa tanto en el home personalizado como en /profile.
 */
export async function getUserFavorites(): Promise<UserFavorites> {
  const user = await checkUser();
  if (!user) return { tournaments: [], teams: [] };

  const favorites = await db.favorite.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      tournament: {
        select: { id: true, name: true, logoUrl: true, locality: true, status: true },
      },
      team: {
        select: { id: true, name: true, logoUrl: true, homeCity: true },
      },
    },
  });

  return {
    tournaments: favorites
      .map((f) => f.tournament)
      .filter((t): t is FavoriteTournamentItem => !!t),
    teams: favorites.map((f) => f.team).filter((t): t is FavoriteTeamItem => !!t),
  };
}

/** IDs de torneos y equipos que el usuario actual sigue (para pintar el botón "Seguir" ya activo). */
export async function getFavoritedIds(): Promise<{
  tournamentIds: Set<string>;
  teamIds: Set<string>;
}> {
  const user = await checkUser();
  if (!user) return { tournamentIds: new Set(), teamIds: new Set() };

  const favorites = await db.favorite.findMany({
    where: { userId: user.id },
    select: { tournamentId: true, teamId: true },
  });

  return {
    tournamentIds: new Set(
      favorites.map((f) => f.tournamentId).filter((id): id is string => !!id),
    ),
    teamIds: new Set(
      favorites.map((f) => f.teamId).filter((id): id is string => !!id),
    ),
  };
}

export async function toggleFavoriteTournament(
  tournamentId: string,
): Promise<ToggleResult> {
  const user = await checkUser();
  if (!user) return { success: false, error: "Debés iniciar sesión" };

  const tournament = await db.tournament.findFirst({
    where: { id: tournamentId, deletedAt: null },
    select: { id: true },
  });
  if (!tournament) return { success: false, error: "Torneo no encontrado" };

  const existing = await db.favorite.findUnique({
    where: { userId_tournamentId: { userId: user.id, tournamentId } },
  });

  if (existing) {
    await db.favorite.delete({ where: { id: existing.id } });
    revalidatePath("/", "layout");
    return { success: true, favorited: false };
  }

  await db.favorite.create({ data: { userId: user.id, tournamentId } });
  revalidatePath("/", "layout");
  return { success: true, favorited: true };
}

export async function toggleFavoriteTeam(teamId: string): Promise<ToggleResult> {
  const user = await checkUser();
  if (!user) return { success: false, error: "Debés iniciar sesión" };

  const team = await db.team.findFirst({
    where: { id: teamId, deletedAt: null },
    select: { id: true },
  });
  if (!team) return { success: false, error: "Equipo no encontrado" };

  const existing = await db.favorite.findUnique({
    where: { userId_teamId: { userId: user.id, teamId } },
  });

  if (existing) {
    await db.favorite.delete({ where: { id: existing.id } });
    revalidatePath("/", "layout");
    return { success: true, favorited: false };
  }

  await db.favorite.create({ data: { userId: user.id, teamId } });
  revalidatePath("/", "layout");
  return { success: true, favorited: true };
}
