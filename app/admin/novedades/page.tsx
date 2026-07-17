import { redirect } from "next/navigation";
import { checkUser } from "@/lib/checkUser";
import { getOrCreateOwnOrg } from "@/lib/orgAuth";
import { hasFeature } from "@/lib/planLimits";
import { getOrgPostsForPanel } from "@modules/novedades/actions/orgPosts";
import { NovedadesClient } from "./NovedadesClient";

/**
 * Panel de Novedades de la liga (S12). Gateado como recurso de organización por
 * el layout. `canCreate` sale de la feature de plan `orgNews` sobre la org del
 * usuario (la misma que apunta la API al crear) — si el plan no la incluye, la
 * pantalla muestra el upsell y deshabilita el alta, pero deja ver/editar lo ya
 * cargado (nunca se ocultan datos).
 */
export default async function NovedadesPage() {
  const user = await checkUser();
  if (!user) redirect("/sign-in");

  const [posts, org] = await Promise.all([
    getOrgPostsForPanel(),
    getOrCreateOwnOrg(user),
  ]);
  const canCreate = await hasFeature(org.id, "orgNews");

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6">
      <NovedadesClient posts={posts} canCreate={canCreate} />
    </div>
  );
}
