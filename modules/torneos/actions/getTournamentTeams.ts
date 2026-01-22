"use server";

import { ITournamentTeam } from "@modules/torneos/types/tournament-teams.types";
import { db } from "@/lib/db";

export const getTournamentTeams = async (
  tournamentId: string,
): Promise<ITournamentTeam[]> => {
  try {
    const associations = await db.tournamentTeam.findMany({
      where: {
        tournamentId,
      },
      include: {
        team: true, // Incluye los datos completos del equipo
        tournament: true, // Incluye los datos del torneo
        phaseStats: {
          include: {
            tournamentPhase: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return associations as ITournamentTeam[];
  } catch (error) {
    console.error("Error al obtener las asociaciones:", error);
    throw new Error("No se pudieron cargar las asociaciones del torneo");
  }
};
