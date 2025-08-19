"use server";

import { ITorneo } from "@/components/torneos/types";
import { db } from "@/lib/db";

export async function getTorneoById(id: string): Promise<ITorneo | null> {
  try {
    const torneo = await db.tournament.findUnique({
      where: { id },
      include: {
        user: true, // Incluye datos del usuario creador, si es necesario
        tournamentTeams: true, // Incluye los equipos del torneo
        matches: true, // Incluye los partidos del torneo
      },
    });

    return torneo as ITorneo | null;
  } catch (error) {
    console.error("Error al obtener torneo por ID:", error);
    throw error;
  }
}
