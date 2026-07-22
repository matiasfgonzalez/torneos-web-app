"use server";

import { db } from "@/lib/db";

/**
 * Otras noticias publicadas, para el pie de una ficha (`/noticias/[id]`).
 *
 * Excluye la que se está leyendo y trae solo lo que la tarjeta muestra — no la
 * noticia entera. Sin autor: es una lista de enlaces, no necesita PII (M1).
 *
 * "Relacionadas" hoy = las más recientes. No hay tags ni categorías en el
 * modelo, así que cualquier otra cosa sería inventar una relación que no
 * existe; cuando haya taxonomía real, se cambia el `orderBy` por el criterio
 * de verdad.
 */
export async function getNoticiasRelacionadas(excludeId: string, take = 3) {
  return db.news.findMany({
    where: { published: true, deletedAt: null, id: { not: excludeId } },
    select: {
      id: true,
      title: true,
      summary: true,
      coverImageUrl: true,
      publishedAt: true,
    },
    orderBy: { publishedAt: "desc" },
    take,
  });
}
