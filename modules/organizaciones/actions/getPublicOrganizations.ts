"use server";

import { db } from "@/lib/db";

export interface OrganizationListItem {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  brandColor: string | null;
  description: string | null;
  locality: string | null;
  tournamentCount: number;
}

/**
 * Catálogo público de ligas (`/ligas`): organizaciones ACTIVAS con al menos un
 * torneo visible (habilitado y no eliminado). Se ordena por cantidad de
 * torneos y luego por nombre — las ligas con más actividad primero.
 *
 * El filtro "con torneos" evita listar ligas recién creadas y vacías (una org
 * nace en el primer uso de cualquier USUARIO, D7); acá solo aparecen las que
 * ya publicaron algo que un hincha pueda seguir.
 */
export async function getPublicOrganizations(): Promise<OrganizationListItem[]> {
  const orgs = await db.organization.findMany({
    where: {
      status: "ACTIVA",
      tournaments: { some: { enabled: true, deletedAt: null } },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      logoUrl: true,
      brandColor: true,
      description: true,
      locality: true,
      _count: {
        select: { tournaments: { where: { enabled: true, deletedAt: null } } },
      },
    },
  });

  return orgs
    .map((o) => ({
      id: o.id,
      name: o.name,
      slug: o.slug,
      logoUrl: o.logoUrl,
      brandColor: o.brandColor,
      description: o.description,
      locality: o.locality,
      tournamentCount: o._count.tournaments,
    }))
    .sort(
      (a, b) =>
        b.tournamentCount - a.tournamentCount ||
        a.name.localeCompare(b.name, "es"),
    );
}
