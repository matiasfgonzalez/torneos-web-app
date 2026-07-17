import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getMatchById } from "@modules/partidos/actions/getMatchById";
import MatchDetailView from "@modules/partidos/components/MatchDetailView";
import { hasFeature } from "@/lib/planLimits";
import { formatDate } from "@/lib/formatDate";

type Params = Promise<{ id: string }>;

export async function generateMetadata({
  params,
}: Readonly<{ params: Params }>): Promise<Metadata> {
  const { id } = await params;
  const match = await getMatchById(id);

  if (!match) return { title: "Partido no encontrado" };

  const versus = `${match.homeTeam.team.name} vs ${match.awayTeam.team.name}`;
  const score =
    match.homeScore != null && match.awayScore != null
      ? ` (${match.homeScore}-${match.awayScore})`
      : "";

  return {
    title: `${versus}${score} · ${match.tournament.name}`,
    description: `${versus} — ${match.tournament.name}, ${formatDate(
      match.dateTime,
      "dd MMM yyyy",
    )}${match.stadium ? ` en ${match.stadium}` : ""}.`,
  };
}

/** Ficha pública de un partido. */
export default async function MatchPage({
  params,
}: Readonly<{ params: Params }>) {
  const { id } = await params;
  const match = await getMatchById(id);

  if (!match) notFound();

  // El centro en vivo (S6) es feature de plan: sin `liveMatch`, la ficha
  // muestra el marcador pero no se auto-actualiza (ni polling ni banner "en
  // vivo"). El orgId viene del torneo del partido.
  const orgId = match.tournament.organizationId;
  const liveEnabled = orgId
    ? await hasFeature(orgId, "liveMatch")
    : false;

  return <MatchDetailView match={match} liveEnabled={liveEnabled} />;
}
