import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { validatePanelAccess } from "@/lib/roleValidation";
import { getMyOrgRole } from "@/lib/orgAuth";
import PlanClient from "./PlanClient";

export const metadata: Metadata = {
  title: "Plan y Facturación | GOLAZO Admin",
};

/**
 * Plan y facturación de la organización (N5). Solo OWNER o ADMINISTRADOR
 * (D12/N14c): el plan es la relación comercial de la liga con la plataforma,
 * no del staff. Las APIs detrás ya lo exigían para mutar; esto alinea la vista.
 */
export default async function PlanPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ plan?: string }>;
}>) {
  const user = await validatePanelAccess();

  if (user.role !== "ADMINISTRADOR" && (await getMyOrgRole(user)) !== "OWNER") {
    redirect("/admin/dashboard");
  }

  // Plan preseleccionado desde el pricing o el wizard (`?plan=PRO`, N14d).
  // PlanClient lo valida contra los planes pagos reales al renderizar.
  const { plan } = await searchParams;

  return <PlanClient initialPlan={plan?.toUpperCase() ?? ""} />;
}
