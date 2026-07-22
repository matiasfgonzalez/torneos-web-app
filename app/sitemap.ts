import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { getBaseUrl } from "@/lib/urls";

// ISR: el sitemap consulta la BD; se regenera cada hora para incluir torneos,
// equipos y noticias nuevos sin necesidad de redeploy.
export const revalidate = 3600;

/**
 * Sitemap dinámico (M3): rutas públicas estáticas + fichas de ligas, torneos
 * (URL canónica `/liga/[orgSlug]/[torneoSlug]`), equipos, jugadores y noticias
 * publicadas. Excluye `/admin`, APIs y áreas privadas (ver robots.ts).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getBaseUrl();
  const url = (path: string) => `${base}${path}`;

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: url("/"), changeFrequency: "daily", priority: 1 },
    { url: url("/ligas"), changeFrequency: "daily", priority: 0.9 },
    { url: url("/torneos"), changeFrequency: "daily", priority: 0.8 },
    { url: url("/equipos"), changeFrequency: "weekly", priority: 0.6 },
    { url: url("/jugadores"), changeFrequency: "weekly", priority: 0.6 },
    { url: url("/noticias"), changeFrequency: "daily", priority: 0.7 },
    { url: url("/partidos"), changeFrequency: "daily", priority: 0.7 },
    { url: url("/terminos"), changeFrequency: "yearly", priority: 0.2 },
    { url: url("/privacidad"), changeFrequency: "yearly", priority: 0.2 },
  ];

  const [orgs, tournaments, teams, players, news] = await Promise.all([
    db.organization.findMany({
      where: { status: "ACTIVA" },
      select: { slug: true, updatedAt: true },
    }),
    db.tournament.findMany({
      where: {
        deletedAt: null,
        enabled: true,
        slug: { not: null },
        status: { in: ["INSCRIPCION", "PENDIENTE", "ACTIVO", "FINALIZADO"] },
        organization: { status: "ACTIVA" },
      },
      select: {
        slug: true,
        updatedAt: true,
        organization: { select: { slug: true } },
      },
    }),
    db.team.findMany({
      where: { deletedAt: null, enabled: true },
      select: { id: true, updatedAt: true },
    }),
    db.player.findMany({
      where: { deletedAt: null, enabled: true },
      select: { id: true, updatedAt: true },
    }),
    db.news.findMany({
      where: { published: true, deletedAt: null },
      select: { id: true, updatedAt: true },
    }),
  ]);

  const orgRoutes: MetadataRoute.Sitemap = orgs.map((o) => ({
    url: url(`/liga/${o.slug}`),
    lastModified: o.updatedAt,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const tournamentRoutes: MetadataRoute.Sitemap = tournaments
    .filter((t) => t.slug && t.organization?.slug)
    .map((t) => ({
      url: url(`/liga/${t.organization.slug}/${t.slug}`),
      lastModified: t.updatedAt,
      changeFrequency: "daily",
      priority: 0.7,
    }));

  const teamRoutes: MetadataRoute.Sitemap = teams.map((t) => ({
    url: url(`/equipos/${t.id}`),
    lastModified: t.updatedAt,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  const playerRoutes: MetadataRoute.Sitemap = players.map((p) => ({
    url: url(`/jugadores/${p.id}`),
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.4,
  }));

  const newsRoutes: MetadataRoute.Sitemap = news.map((n) => ({
    url: url(`/noticias/${n.id}`),
    lastModified: n.updatedAt,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [
    ...staticRoutes,
    ...orgRoutes,
    ...tournamentRoutes,
    ...teamRoutes,
    ...playerRoutes,
    ...newsRoutes,
  ];
}
