import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { validatePanelAccess } from "@/lib/roleValidation";
import { getMyOrgRole } from "@/lib/orgAuth";
import MembersClient from "./MembersClient";

export const metadata: Metadata = {
  title: "Miembros | GOLAZO Admin",
};

/**
 * Gestión de miembros e invitaciones de la organización (N6).
 * Solo OWNER o ADMINISTRADOR (matriz N1, D12/N14c): quién trabaja en la liga
 * es parte de la relación comercial (maxMembers del plan), no del staff.
 * Las APIs de mutación ya lo exigían; esto alinea la vista.
 */
export default async function MiembrosPage() {
  const user = await validatePanelAccess();

  if (user.role !== "ADMINISTRADOR" && (await getMyOrgRole(user)) !== "OWNER") {
    redirect("/admin/dashboard");
  }

  return <MembersClient />;
}
