"use server";

import { db } from "@/lib/db";

export async function getMatches(id: string) {
  try {
    const matches = await db.match.findMany({
      where: id
        ? { tournamentId: id } // 👈 filtra si hay id
        : undefined, // 👈 sino no aplica filtro
      include: {
        tournament: true,
        homeTeam: {
          include: {
            team: true,
          },
        },
        awayTeam: {
          include: {
            team: true,
          },
        },
        goals: {
          include: {
            teamPlayer: {
              include: {
                player: true,
              },
            },
          },
        },
        phase: true,
      },
      orderBy: {
        dateTime: "asc",
      },
    });
    return matches;
  } catch (error) {
    console.error("Error fetching matches:", error);
    throw new Error("Failed to fetch matches");
  }
}

