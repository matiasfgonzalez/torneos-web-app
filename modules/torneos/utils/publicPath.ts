/**
 * URL pública de un torneo (N9): la canónica `/liga/[orgSlug]/[torneoSlug]`
 * si ambos slugs existen, o la legacy por UUID como fallback (que redirige
 * a la canónica en el server).
 *
 * Helper puro y client-safe — no importa Prisma (a diferencia de
 * getTournamentCanonicalPath, que resuelve por query).
 */
export function tournamentPublicPath(t: {
  id: string;
  slug?: string | null;
  organization?: { slug: string } | null;
}): string {
  if (t.slug && t.organization?.slug) {
    return `/liga/${t.organization.slug}/${t.slug}`;
  }
  return `/torneos/${t.id}`;
}
