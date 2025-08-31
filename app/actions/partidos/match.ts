"use server";

import { db } from "@/lib/db";

export async function getMatches() {
  try {
    const matches = await db.match.findMany({
      include: {
        tournament: true,
        homeTeam: true,
        awayTeam: true,
        goals: {
          include: {
            player: true,
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
