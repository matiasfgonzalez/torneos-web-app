"use server";

import { ITorneo } from "@modules/torneos/types";
import { db } from "@/lib/db";

export async function getTorneoById(id: string): Promise<ITorneo | null> {
  try {
    const torneo = await db.tournament.findFirst({
      where: { id, deletedAt: null },
      include: {
        tournamentTeams: {
          include: {
            team: true, // 👈 trae los datos del equipo
            tournament: true, // 👈 trae los datos del torneo (opcional, ya lo estás trayendo arriba)
            teamPlayer: {
              include: {
                player: true,
              },
            },
            phaseStats: {
              include: {
                tournamentPhase: true, // 👈 incluye info de la fase para filtrar por tipo
              },
            },
          },
        },
        tournamentPhases: {
          orderBy: { order: "asc" },
        },
        matches: {
          include: {
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
            tournamentPhase: true, // 👈 incluye la fase del partido
            goals: {
              include: {
                teamPlayer: {
                  include: {
                    player: true,
                    tournamentTeam: {
                      include: {
                        team: true,
                      },
                    },
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
                    tournamentTeam: {
                      include: {
                        team: true,
                      },
                    },
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
          orderBy: { dateTime: "asc" },
        },
      },
    });

    return torneo as ITorneo | null;
  } catch (error) {
    console.error("Error al obtener torneo por ID:", error);
    throw error;
  }
}
