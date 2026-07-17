"use server";

import { db } from "@/lib/db";
import { getPanelOrgIds, orgScopeWhere } from "@/lib/orgAuth";
import type { IOrgPost, IPublicOrgPost } from "@modules/novedades/types";

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
