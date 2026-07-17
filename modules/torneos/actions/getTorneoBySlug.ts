"use server";

import type { TournamentStatus } from "@prisma/client";

import { db } from "@/lib/db";
import { ITorneo } from "@modules/torneos/types";
import { makeStandingsComparator } from "@/lib/standings/config";
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

export interface TournamentOgRow {
  name: string;
  points: number;
  matchesPlayed: number;
  goalDifference: number;
}

export interface TournamentOgData {
  name: string;
  organizationName: string;
  status: TournamentStatus;
  /** Top de la tabla, ya ordenado por los desempates del torneo (máx. 5). */
  standings: TournamentOgRow[];
  teamCount: number;
}

/**
 * Datos para la imagen OG del torneo (S4): nombre, liga, estado y el top de la
 * tabla. Es su propia consulta, mínima, porque la OG image se genera en cada
 * scrapeo de WhatsApp/redes y no puede arrastrar el include pesado de
 * `getTorneoById`.
 */
export async function getTournamentOgData(
  orgSlug: string,
  tournamentSlug: string,
): Promise<TournamentOgData | null> {
  const t = await db.tournament.findFirst({
    where: {
      slug: tournamentSlug,
      deletedAt: null,
      organization: { slug: orgSlug },
    },
    select: {
      name: true,
      status: true,
      tiebreakers: true,
      organization: { select: { name: true } },
      // Solo los equipos que de verdad juegan: los pendientes/rechazados de la
      // inscripción online no aparecen en la tabla.
      tournamentTeams: {
        where: { registrationStatus: "INSCRIPTO" },
        select: {
          points: true,
          matchesPlayed: true,
          wins: true,
          goalsFor: true,
          goalsAgainst: true,
          goalDifference: true,
          team: { select: { name: true } },
        },
      },
    },
  });
  if (!t) return null;

  const ranked = [...t.tournamentTeams].sort(
    makeStandingsComparator(t.tiebreakers),
  );

  return {
    name: t.name,
    organizationName: t.organization.name,
    status: t.status,
    teamCount: t.tournamentTeams.length,
    standings: ranked.slice(0, 5).map((row) => ({
      name: row.team.name,
      points: row.points,
      matchesPlayed: row.matchesPlayed,
      goalDifference: row.goalDifference,
    })),
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
