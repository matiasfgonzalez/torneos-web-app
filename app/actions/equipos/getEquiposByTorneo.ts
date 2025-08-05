// app/actions/getNoticias.ts
"use server";

import { ITeam } from "@/components/equipos/types";
import { db } from "@/lib/db"; // Asegurate que esta ruta sea correcta

export async function getEquiposByTorneo(id: string): Promise<ITeam[]> {
    try {
        const equipos = await db.team.findMany({
            where: { id },
            orderBy: {
                createdAt: "desc"
            }
        });
        return equipos as ITeam[];
    } catch (error) {
        console.error("Error al obtener equipos:", error);
        throw error;
    }
}
