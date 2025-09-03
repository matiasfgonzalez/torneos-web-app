// app/actions/getJugadores.ts
"use server";

import { IPlayer } from "@/components/jugadores/types";
import { db } from "@/lib/db"; // Asegurate que esta ruta sea correcta

export async function getJugadores(): Promise<IPlayer[]> {
  try {
    const jugadores = await db.player.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return jugadores as IPlayer[];
  } catch (error) {
    console.error("Error al obtener jugadores:", error);
    throw error;
  }
}
