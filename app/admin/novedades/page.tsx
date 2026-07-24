import { redirect } from "next/navigation";
import { checkUser } from "@/lib/checkUser";
import { getOrCreateOwnOrg } from "@/lib/orgAuth";
import { hasFeature } from "@/lib/planLimits";
import { getOrgPostsForPanelPaged } from "@modules/novedades/actions/orgPosts";
import { parseTableParams, type RawSearchParams } from "@/lib/tableParams";
import { NovedadesClient } from "./NovedadesClient";

/**
 * Panel de Novedades de la liga (S12). Gateado como recurso de organización por
 * el layout. `canCreate` sale de la feature de plan `orgNews` sobre la org del
 * usuario (la misma que apunta la API al crear) — si el plan no la incluye, la
 * pantalla muestra el upsell y deshabilita el alta, pero deja ver/editar lo ya
 * cargado (nunca se ocultan datos).
 */
export default async function NovedadesPage({
  searchParams,
}: Readonly<{ searchParams: Promise<RawSearchParams> }>) {
  const user = await checkUser();
  if (!user) redirect("/sign-in");

  const sp = await searchParams;
  const params = parseTableParams(sp, { filterKeys: ["published"] });

  const [{ rows, total }, org] = await Promise.all([
    getOrgPostsForPanelPaged(params),
    getOrCreateOwnOrg(user),
  ]);
  const canCreate = await hasFeature(org.id, "orgNews");

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6">
      <NovedadesClient
        posts={rows}
        canCreate={canCreate}
        server={{
          total,
          page: params.page,
          pageSize: params.pageSize,
          q: params.q,
          sort: params.sort,
          dir: params.dir,
          filterValues: { published: params.filters.published ?? "all" },
        }}
      />
    </div>
  );
}
