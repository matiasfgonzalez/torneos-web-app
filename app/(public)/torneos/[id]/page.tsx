import { permanentRedirect } from "next/navigation";
import TournamentDetailView from "@modules/torneos/components/TournamentDetailView";
import { getTournamentCanonicalPath } from "@modules/torneos/actions/getTorneoBySlug";

/**
 * URL legacy por UUID. Si el torneo ya tiene URL canónica por slug (N9),
 * redirige a `/liga/[orgSlug]/[torneoSlug]`; si no, renderiza la vista.
 *
 * `permanentRedirect` (308) y no `redirect` (307): la mudanza a la URL con slug
 * es definitiva, y un 307 le dice al buscador "esto es temporal, seguí
 * indexando la vieja". Con 308 el link jugo transfiere a la canónica y la URL
 * por UUID deja de competir con ella en los resultados (M3).
 */
export default async function TournamentByIdPage({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;

  const canonical = await getTournamentCanonicalPath(id);
  if (canonical) permanentRedirect(canonical);

  return <TournamentDetailView id={id} />;
}
