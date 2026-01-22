// app/actions/getNoticias.ts
"use server";

import { ITeam } from "@modules/equipos/types/types";
import { db } from "@/lib/db"; // Asegurate que esta ruta sea correcta

export async function getEquipos(): Promise<ITeam[]> {
  try {
    const equipos = await db.team.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return equipos as ITeam[];
  } catch (error) {
    console.error("Error al obtener equipo:", error);
    throw error;
  }
}
