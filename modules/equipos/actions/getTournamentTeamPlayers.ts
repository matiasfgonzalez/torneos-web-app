"use server";

import { db } from "@/lib/db";

export async function getTournamentTeamPlayers(tournamentTeamId: string) {
  try {
    const players = await db.teamPlayer.findMany({
      where: {
        tournamentTeamId: tournamentTeamId,
      },
      include: {
        player: true,
      },
      orderBy: {
        player: {
          name: "asc",
        },
      },
    });
    return players;
  } catch (error) {
    console.error("Error fetching tournament team players:", error);
    return [];
  }
}

