import type { Metadata } from "next";
import { validatePanelAccess } from "@/lib/roleValidation";
import OrganizacionesClient from "./OrganizacionesClient";

export const metadata: Metadata = {
  title: "Organizaciones | GOLAZO Admin",
};

/**
 * Listado de organizaciones + métricas SaaS para el admin de plataforma
 * (N10): estado, plan, último pago, y acción de suspender/reactivar.
 */
export default async function OrganizacionesPage() {
  await validatePanelAccess({ adminOnly: true });

  return <OrganizacionesClient />;
}
