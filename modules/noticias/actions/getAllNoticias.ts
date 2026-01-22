// app/actions/noticias/getAllNoticias.ts
"use server";

import { INoticia } from "@modules/noticias/types";
import { db } from "@/lib/db";

export async function getAllNoticias(): Promise<INoticia[]> {
  try {
    const noticias = await db.news.findMany({
      where: {
        published: true, // Solo noticias publicadas
      },
      include: {
        user: true, // Incluye los datos del usuario creador
      },
      orderBy: {
        publishedAt: "desc",
      },
    });
    return noticias as INoticia[];
  } catch (error) {
    console.error("Error al obtener todas las noticias:", error);
    throw error;
  }
}
