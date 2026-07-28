"use server";

import type { Prisma } from "@/lib/generated/prisma/client";
import { db } from "@/lib/db";
import { newsAuthorSelect } from "@modules/noticias/authorSelect";
import type { INoticia } from "@modules/noticias/types";
import type { ParsedTableParams } from "@/lib/tableParams";
import { requireActionRole } from "@/lib/actionRoleValidation";

/**
 * Listado paginado server-side de noticias para el panel (M7).
 *
 * Va como server action aparte y **no** toca `GET /api/noticias`: esa ruta es
 * pública (la consume la lista pública de noticias) y devuelve un array plano;
 * cambiarle el shape a un envelope paginado la rompería. Mismo `select` sin
 * `content` (A3): el listado no necesita el cuerpo.
 */

/** Columnas ordenables → `orderBy` de Prisma. */
const NEWS_ORDER_BY: Record<string, keyof Prisma.NewsOrderByWithRelationInput> =
  {
    article: "title",
    publishedAt: "publishedAt",
    status: "published",
  };

const listSelect = {
  id: true,
  title: true,
  summary: true,
  coverImageUrl: true,
  published: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  userId: true,
  user: newsAuthorSelect, // autor sin PII (M1)
} satisfies Prisma.NewsSelect;

/**
 * ⚠️ **Con guarda de rol (hallazgo #16).** Una server action es un endpoint de
 * red: no alcanza con que solo la llame una pantalla del panel. Esta devuelve
 * **todas** las noticias, borradores incluidos, así que sin control de acceso
 * era otra puerta al mismo dato que la del hallazgo — y encima con paginación,
 * búsqueda y filtro por estado.
 *
 * Devuelve vacío en vez de tirar: la pantalla ya está detrás del middleware del
 * panel, así que un anónimo acá es alguien invocando la action a mano.
 */
export async function getNoticiasAdminPaged(
  params: ParsedTableParams,
): Promise<{ rows: INoticia[]; total: number }> {
  const auth = await requireActionRole(["ADMINISTRADOR"]);
  if (auth.error) return { rows: [], total: 0 };

  const conditions: Prisma.NewsWhereInput[] = [{ deletedAt: null }];

  if (params.q) {
    conditions.push({
      OR: [
        { title: { contains: params.q, mode: "insensitive" } },
        { summary: { contains: params.q, mode: "insensitive" } },
      ],
    });
  }

  const published = params.filters.published;
  if (published === "published") conditions.push({ published: true });
  else if (published === "draft") conditions.push({ published: false });

  const where: Prisma.NewsWhereInput = { AND: conditions };

  const orderCol = params.sort ? NEWS_ORDER_BY[params.sort] : undefined;
  // `publishedAt` es nullable (A6): los borradores van al final en vez de
  // encabezar la tabla (en Postgres un NULL ordena primero con DESC).
  const orderBy: Prisma.NewsOrderByWithRelationInput = !orderCol
    ? { createdAt: "desc" }
    : orderCol === "publishedAt"
      ? { publishedAt: { sort: params.dir, nulls: "last" } }
      : { [orderCol]: params.dir };

  const [rows, total] = await Promise.all([
    db.news.findMany({
      where,
      orderBy,
      skip: params.skip,
      take: params.take,
      select: listSelect,
    }),
    db.news.count({ where }),
  ]);

  return { rows: rows as unknown as INoticia[], total };
}

/** Contadores del panel de noticias (agregados — M7). */
export async function getNoticiasStats(): Promise<{
  total: number;
  published: number;
  drafts: number;
}> {
  // Misma guarda que el listado: el conteo de borradores también es dato del
  // panel (dice cuántas noticias sin publicar hay).
  const auth = await requireActionRole(["ADMINISTRADOR"]);
  if (auth.error) return { total: 0, published: 0, drafts: 0 };

  const [total, published] = await Promise.all([
    db.news.count({ where: { deletedAt: null } }),
    db.news.count({ where: { deletedAt: null, published: true } }),
  ]);
  return { total, published, drafts: total - published };
}
