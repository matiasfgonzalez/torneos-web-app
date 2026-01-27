// app/actions/getNoticias.ts
"use server";

import { ITorneo } from "@modules/torneos/types";
import { db } from "@/lib/db"; // Asegurate que esta ruta sea correcta

export async function getTorneos(): Promise<ITorneo[]> {
  try {
    const torneos = await db.tournament.findMany({
      where: {
        enabled: true, // Solo torneos habilitados
      },
      include: {
        user: true,
        tournamentTeams: true,
        matches: true, // Incluir partidos para contar programados
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return torneos as ITorneo[];
  } catch (error) {
    console.error("Error al obtener noticias:", error);
    throw error;
  }
}
