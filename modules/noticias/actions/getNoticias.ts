// app/actions/getNoticias.ts
"use server";

import { INoticia } from "@modules/noticias/types";
import { newsAuthorSelect } from "@modules/noticias/authorSelect";
import { db } from "@/lib/db"; // Asegurate que esta ruta sea correcta

export async function getNoticias(): Promise<INoticia[]> {
  try {
    const noticias = await db.news.findMany({
      where: {
        published: true, // Solo noticias publicadas
      },
      include: {
        user: newsAuthorSelect, // autor sin PII (M1)
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 3, // 👈 Limita a las 3 noticias más recientes
    });
    return noticias as INoticia[];
  } catch (error) {
    console.error("Error al obtener noticias:", error);
    throw error;
  }
}
