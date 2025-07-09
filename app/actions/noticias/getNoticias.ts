// app/actions/getNoticias.ts
"use server";

import { db } from "@/lib/db"; // Asegurate que esta ruta sea correcta

export async function getNoticias() {
    try {
        const noticias = await db.news.findMany({
            include: {
                user: true // Opcional: incluye los datos del usuario creador
            },
            orderBy: {
                createdAt: "desc"
            },
            take: 3 // 👈 Limita a las 3 noticias más recientes
        });
        return noticias;
    } catch (error) {
        console.error("Error al obtener noticias:", error);
        throw error;
    }
}
