"use server";

import { db } from "@/lib/db";
import { IPartidos } from "@modules/partidos/types";

export async function getMatchById(id: string): Promise<IPartidos | null> {
  try {
    const match = await db.match.findUnique({
      where: { id },
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
        tournamentPhase: true,
        goals: {
          include: {
            teamPlayer: {
              include: {
                player: true,
              },
            },
          },
          orderBy: { minute: "asc" },
        },
        cards: {
          include: {
            teamPlayer: {
              include: {
                player: true,
              },
            },
          },
          orderBy: { minute: "asc" },
        },
        referees: {
          include: {
            referee: true,
          },
        },
      },
    });

    return match as unknown as IPartidos | null;
  } catch (error) {
    console.error("Error al obtener partido por ID:", error);
    throw error;
  }
}
