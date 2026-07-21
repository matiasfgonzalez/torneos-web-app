import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { validatePanelAccess } from "@/lib/roleValidation";
import { getMyOrgRole, getOrCreateOwnOrg } from "@/lib/orgAuth";
import { hasFeature } from "@/lib/planLimits";
import MiLigaClient from "./MiLigaClient";

export const metadata: Metadata = {
  title: "Mi liga | GOLAZO Admin",
};

/**
 * Mi liga / Marca (M6) — perfil público y personalización de la liga.
 * Solo OWNER o ADMINISTRADOR (D12/N14c): la identidad de la liga es la
 * relación comercial con la plataforma, no del staff. Reusa el "paso de
 * marca" del wizard de alta contra `PATCH /api/org` (el endpoint ya valida
 * OWNER). El color de marca se gatea con la feature `customBranding` del
 * plan: sin ella se muestra el upsell en vez del selector.
 */
export default async function MiLigaPage() {
  const user = await validatePanelAccess();

  if (user.role !== "ADMINISTRADOR" && (await getMyOrgRole(user)) !== "OWNER") {
    redirect("/admin/dashboard");
  }

  const org = await getOrCreateOwnOrg(user);
  const canBrand = await hasFeature(org.id, "customBranding");

  return (
    <MiLigaClient
      canBrand={canBrand}
      publicSlug={org.slug}
      initialOrg={{
        name: org.name,
        locality: org.locality,
        description: org.description,
        phone: org.phone,
        logoUrl: org.logoUrl,
        logoPublicId: org.logoPublicId,
        brandColor: org.brandColor,
      }}
    />
  );
}
