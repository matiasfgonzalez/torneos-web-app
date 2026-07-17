import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TournamentDetailView from "@modules/torneos/components/TournamentDetailView";
import { getTournamentMetaBySlug } from "@modules/torneos/actions/getTorneoBySlug";

type RouteParams = Promise<{ slug: string; torneo: string }>;

/**
 * URL pública canónica de un torneo (N9): `/liga/[slug]/[torneo]`.
 * Compartible por WhatsApp/QR y con metadata OG para previsualización.
 */
export async function generateMetadata({
  params,
}: {
  params: RouteParams;
}): Promise<Metadata> {
  const { slug, torneo } = await params;
  const meta = await getTournamentMetaBySlug(slug, torneo);
  if (!meta) return { title: "Torneo no encontrado | GOLAZO" };

  const title = `${meta.name} — ${meta.organizationName} | GOLAZO`;
  const description =
    meta.description ??
    `Seguí ${meta.name} en GOLAZO: tabla de posiciones, fixture, resultados y goleadores en tiempo real.`;

  // La imagen NO se declara acá a propósito: `opengraph-image.tsx` en esta
  // misma carpeta la genera dinámicamente y Next la inyecta sola. Repetir
  // `openGraph.images` la pisaría con algo estático.
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function TournamentBySlugPage({
  params,
}: Readonly<{ params: RouteParams }>) {
  const { slug, torneo } = await params;
  const meta = await getTournamentMetaBySlug(slug, torneo);
  if (!meta) return notFound();

  return <TournamentDetailView id={meta.id} />;
}
