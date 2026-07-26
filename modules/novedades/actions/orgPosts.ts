"use server";

import type { Prisma } from "@/lib/generated/prisma/client";
import { db } from "@/lib/db";
import { getPanelOrgIds, orgScopeWhere } from "@/lib/orgAuth";
import type { IOrgPost, IPublicOrgPost } from "@modules/novedades/types";
import type { ParsedTableParams } from "@/lib/tableParams";

const POST_FIELDS = {
  id: true,
  title: true,
  summary: true,
  content: true,
  coverImageUrl: true,
  coverImagePublicId: true,
  published: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

/**
 * Novedades visibles en el panel del usuario (S12), acotadas a sus
 * organizaciones (o todas si es ADMINISTRADOR sin "ver como"). Incluye
 * borradores; excluye eliminadas.
 */
export async function getOrgPostsForPanel(): Promise<IOrgPost[]> {
  const orgIds = await getPanelOrgIds();
  if (orgIds !== null && orgIds.length === 0) return [];

  return db.orgPost.findMany({
    where: { deletedAt: null, ...orgScopeWhere(orgIds) },
    orderBy: { createdAt: "desc" },
    select: POST_FIELDS,
  });
}

/** Columnas ordenables → `orderBy` de Prisma (M7). */
const POST_ORDER_BY: Record<
  string,
  keyof Prisma.OrgPostOrderByWithRelationInput
> = {
  post: "title",
  date: "createdAt",
  status: "published",
};

/** Versión paginada server-side del panel de novedades (M7). */
export async function getOrgPostsForPanelPaged(
  params: ParsedTableParams,
): Promise<{ rows: IOrgPost[]; total: number }> {
  const orgIds = await getPanelOrgIds();
  if (orgIds !== null && orgIds.length === 0) return { rows: [], total: 0 };

  const conditions: Prisma.OrgPostWhereInput[] = [
    { deletedAt: null, ...orgScopeWhere(orgIds) },
  ];
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

  const where: Prisma.OrgPostWhereInput = { AND: conditions };

  const orderCol = params.sort ? POST_ORDER_BY[params.sort] : undefined;
  const orderBy: Prisma.OrgPostOrderByWithRelationInput = orderCol
    ? { [orderCol]: params.dir }
    : { createdAt: "desc" };

  const [rows, total] = await Promise.all([
    db.orgPost.findMany({
      where,
      orderBy,
      skip: params.skip,
      take: params.take,
      select: POST_FIELDS,
    }),
    db.orgPost.count({ where }),
  ]);

  return { rows, total };
}

/**
 * Novedades PUBLICADAS de una liga (para su página pública `/liga/[slug]`).
 * Ordenadas por fecha de publicación (la más nueva primero).
 */
export async function getPublishedOrgPosts(
  organizationId: string,
  limit?: number,
): Promise<IOrgPost[]> {
  return db.orgPost.findMany({
    where: { organizationId, published: true, deletedAt: null },
    orderBy: { publishedAt: "desc" },
    take: limit,
    select: POST_FIELDS,
  });
}

/**
 * Una novedad publicada por id, con el contexto de su liga (página de detalle
 * pública). `null` si no existe, es borrador o está eliminada.
 */
export async function getPublishedOrgPost(
  id: string,
): Promise<IPublicOrgPost | null> {
  return db.orgPost.findFirst({
    where: { id, published: true, deletedAt: null },
    select: {
      ...POST_FIELDS,
      organization: { select: { slug: true, name: true, logoUrl: true } },
    },
  });
}
