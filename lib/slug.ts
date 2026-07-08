import { db } from "@/lib/db";

/**
 * Slugs y URLs públicas compartibles (N9).
 *
 * Convierte un nombre en un slug seguro para URL y garantiza unicidad
 * (organizaciones a nivel global, torneos por organización). Base de las
 * URLs `/liga/[slug]` y `/liga/[slug]/[torneo]` que habilitan compartir por
 * WhatsApp, QR y OG images (S4).
 */
export function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .normalize("NFD")
      .replaceAll(/[̀-ͯ]/g, "") // sacar diacríticos (á→a)
      .replaceAll(/[^a-z0-9]+/g, "-")
      .replaceAll(/(^-|-$)/g, "")
      .slice(0, 60) || "item"
  );
}

/** Slug único de organización (a nivel global) */
export async function uniqueOrganizationSlug(
  base: string,
  excludeOrgId?: string,
): Promise<string> {
  const slug = slugify(base) || "liga";
  const existing = await db.organization.findUnique({ where: { slug } });
  if (!existing || existing.id === excludeOrgId) return slug;
  return disambiguate(slug, async (candidate) => {
    const found = await db.organization.findUnique({
      where: { slug: candidate },
    });
    return !found || found.id === excludeOrgId;
  });
}

/** Slug único de torneo dentro de una organización */
export async function uniqueTournamentSlug(
  base: string,
  organizationId: string,
  excludeTournamentId?: string,
): Promise<string> {
  const slug = slugify(base) || "torneo";
  return disambiguate(slug, async (candidate) => {
    const found = await db.tournament.findFirst({
      where: { organizationId, slug: candidate },
      select: { id: true },
    });
    return !found || found.id === excludeTournamentId;
  });
}

/**
 * Devuelve el primer candidato libre: `slug`, `slug-2`, `slug-3`, ...
 * `isFree` decide si un candidato está disponible.
 */
async function disambiguate(
  slug: string,
  isFree: (candidate: string) => Promise<boolean>,
): Promise<string> {
  if (await isFree(slug)) return slug;
  for (let i = 2; i < 1000; i++) {
    const candidate = `${slug}-${i}`;
    if (await isFree(candidate)) return candidate;
  }
  // Fallback improbable: sufijo aleatorio
  return `${slug}-${Math.random().toString(36).slice(2, 6)}`;
}
