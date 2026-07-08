"use server";

import { db } from "@/lib/db";
import { ITorneo } from "@modules/torneos/types";
import { getTorneoById } from "./getTorneoById";

/**
 * Resuelve un torneo por su URL pública `/liga/[orgSlug]/[torneoSlug]` (N9).
 * Reutiliza el include completo de `getTorneoById`.
 */
export async function getTorneoBySlug(
  orgSlug: string,
  tournamentSlug: string,
): Promise<ITorneo | null> {
  const match = await db.tournament.findFirst({
    where: {
      slug: tournamentSlug,
      deletedAt: null,
      organization: { slug: orgSlug },
    },
    select: { id: true },
  });
  if (!match) return null;
  return getTorneoById(match.id);
}

export interface TournamentMeta {
  id: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  organizationName: string;
}

/**
 * Datos livianos de un torneo por slug para resolver el `id` y armar la
 * metadata SEO/OG sin traer todo el include pesado.
 */
export async function getTournamentMetaBySlug(
  orgSlug: string,
  tournamentSlug: string,
): Promise<TournamentMeta | null> {
  const t = await db.tournament.findFirst({
    where: {
      slug: tournamentSlug,
      deletedAt: null,
      organization: { slug: orgSlug },
    },
    select: {
      id: true,
      name: true,
      description: true,
      logoUrl: true,
      organization: { select: { name: true } },
    },
  });
  if (!t) return null;
  return {
    id: t.id,
    name: t.name,
    description: t.description,
    logoUrl: t.logoUrl,
    organizationName: t.organization.name,
  };
}

/**
 * Ruta pública canónica de un torneo (`/liga/[orgSlug]/[slug]`) o null si aún
 * no tiene slug. Se usa para redirigir las URLs viejas por UUID.
 */
export async function getTournamentCanonicalPath(
  id: string,
): Promise<string | null> {
  const t = await db.tournament.findUnique({
    where: { id },
    select: { slug: true, organization: { select: { slug: true } } },
  });
  if (!t?.slug || !t.organization?.slug) return null;
  return `/liga/${t.organization.slug}/${t.slug}`;
}
