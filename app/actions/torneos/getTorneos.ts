// app/actions/getNoticias.ts
"use server";

import { ITorneo } from "@/components/torneos/types";
import { db } from "@/lib/db"; // Asegurate que esta ruta sea correcta

export async function getTorneos(): Promise<ITorneo[]> {
    try {
        const torneos = await db.tournament.findMany({
            include: {
                user: true // Opcional: incluye los datos del usuario creador
            },
            orderBy: {
                createdAt: "desc"
            },
            take: 3 // 👈 Limita a las 3 noticias más recientes
        });
        return torneos as ITorneo[];
    } catch (error) {
        console.error("Error al obtener noticias:", error);
        throw error;
    }
}
