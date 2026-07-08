import { redirect } from "next/navigation";
import TournamentDetailView from "@modules/torneos/components/TournamentDetailView";
import { getTournamentCanonicalPath } from "@modules/torneos/actions/getTorneoBySlug";

/**
 * URL legacy por UUID. Si el torneo ya tiene URL canónica por slug (N9),
 * redirige a `/liga/[orgSlug]/[torneoSlug]`; si no, renderiza la vista.
 */
export default async function TournamentByIdPage({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;

  const canonical = await getTournamentCanonicalPath(id);
  if (canonical) redirect(canonical);

  return <TournamentDetailView id={id} />;
}
