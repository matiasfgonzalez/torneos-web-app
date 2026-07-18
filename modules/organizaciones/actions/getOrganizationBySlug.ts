"use server";

import { db } from "@/lib/db";

export interface OrganizationPublicTournament {
  id: string;
  name: string;
  slug: string | null;
  logoUrl: string | null;
  ageGroup: string;
  gender: string;
  division: string | null;
  status: string;
  startDate: Date;
  teamCount: number;
}

export interface OrganizationPublic {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  brandColor: string | null;
  description: string | null;
  locality: string | null;
  phone: string | null;
  status: string;
  tournaments: OrganizationPublicTournament[];
}

/**
 * Datos públicos de una liga por su slug (`/liga/[slug]`, N9): perfil + sus
 * torneos visibles (habilitados y no eliminados).
 */
export async function getOrganizationBySlug(
  slug: string,
): Promise<OrganizationPublic | null> {
  const org = await db.organization.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      logoUrl: true,
      brandColor: true,
      description: true,
      locality: true,
      phone: true,
      status: true,
      tournaments: {
        where: { enabled: true, deletedAt: null },
        orderBy: { startDate: "desc" },
        select: {
          id: true,
          name: true,
          slug: true,
          logoUrl: true,
          ageGroup: true,
          gender: true,
          division: true,
          status: true,
          startDate: true,
          _count: { select: { tournamentTeams: true } },
        },
      },
    },
  });

  if (!org) return null;

  return {
    id: org.id,
    name: org.name,
    slug: org.slug,
    logoUrl: org.logoUrl,
    brandColor: org.brandColor,
    description: org.description,
    locality: org.locality,
    phone: org.phone,
    status: org.status,
    tournaments: org.tournaments.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      logoUrl: t.logoUrl,
      ageGroup: t.ageGroup,
      gender: t.gender,
      division: t.division,
      status: t.status,
      startDate: t.startDate,
      teamCount: t._count.tournamentTeams,
    })),
  };
}
