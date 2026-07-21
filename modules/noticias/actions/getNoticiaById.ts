"use server";

import { db } from "@/lib/db";
import { INoticia } from "@modules/noticias/types";
import { newsAuthorSelect } from "@modules/noticias/authorSelect";

/**
 * Una noticia publicada por id, para la ficha pública `/noticias/[id]` (SSR).
 *
 * Filtra `published: true` y `deletedAt: null`: la página es pública, así que
 * un borrador o una noticia eliminada NO se muestran (y ahora que es SSR,
 * tampoco se indexan). El admin previsualiza borradores desde `/admin/noticias`.
 * `null` → la página llama `notFound()` (404 real).
 */
export async function getNoticiaById(id: string): Promise<INoticia | null> {
  const noticia = await db.news.findFirst({
    where: { id, published: true, deletedAt: null },
    include: { user: newsAuthorSelect },
  });
  return noticia as INoticia | null;
}
