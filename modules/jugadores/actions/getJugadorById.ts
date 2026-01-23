"use server";

import { db } from "@/lib/db";

export async function getJugadorById(id: string) {
  try {
    const jugador = await db.player.findUnique({
      where: { id },
      include: {
        teamPlayer: {
          include: {
            tournamentTeam: {
              include: {
                team: true,
                tournament: true,
              },
            },
            goals: {
              include: {
                match: {
                  include: {
                    homeTeam: {
                      include: { team: true },
                    },
                    awayTeam: {
                      include: { team: true },
                    },
                  },
                },
              },
            },
            cards: {
              include: {
                match: true,
              },
            },
          },
        },
      },
    });

    if (!jugador) {
      return null;
    }

    return jugador;
  } catch (error) {
    console.error("Error al obtener jugador:", error);
    throw error;
  }
}

// Tipo exportado para usar en componentes
export type PlayerWithDetails = NonNullable<
  Awaited<ReturnType<typeof getJugadorById>>
>;
