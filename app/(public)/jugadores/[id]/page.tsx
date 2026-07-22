import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getJugadorById } from "@/modules/jugadores/actions/getJugadorById";
import { getJugadorMeta } from "@/modules/jugadores/actions/getJugadorMeta";
import PlayerDetailPage from "./player-detail-page";

type tParams = Promise<{ id: string }>;

export async function generateMetadata({
  params,
}: {
  readonly params: tParams;
}): Promise<Metadata> {
  const { id } = await params;
  const jugador = await getJugadorMeta(id);
  if (!jugador) return { title: "Jugador no encontrado | GOLAZO" };

  const parts = [jugador.position, jugador.nationality].filter(Boolean);
  const description =
    jugador.description ??
    `Estadísticas y trayectoria de ${jugador.name}${
      parts.length ? ` — ${parts.join(", ")}` : ""
    } en GOLAZO.`;
  const image = jugador.imageUrlFace ?? jugador.imageUrl;

  return {
    title: `${jugador.name} | GOLAZO`,
    description,
    alternates: { canonical: `/jugadores/${id}` },
    openGraph: {
      title: jugador.name,
      description,
      type: "profile",
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default async function JugadorPage({
  params,
}: {
  readonly params: tParams;
}) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  const jugador = await getJugadorById(id);

  if (!jugador) {
    notFound();
  }

  return <PlayerDetailPage player={jugador} />;
}
