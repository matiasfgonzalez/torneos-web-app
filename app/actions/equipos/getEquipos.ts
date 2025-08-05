// app/actions/getNoticias.ts
"use server";

import { ITeam } from "@/components/equipos/types";
import { db } from "@/lib/db"; // Asegurate que esta ruta sea correcta

export async function getEquipos(): Promise<ITeam[]> {
    try {
        const equipos = await db.team.findMany({
            include: {
                players: true
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        return equipos as ITeam[];
    } catch (error) {
        console.error("Error al obtener equipo:", error);
        throw error;
    }
}
