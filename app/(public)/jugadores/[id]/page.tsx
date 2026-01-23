import { notFound } from "next/navigation";
import { getJugadorById } from "@/modules/jugadores/actions/getJugadorById";
import PlayerDetailPage from "./player-detail-page";

type tParams = Promise<{ id: string }>;

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
