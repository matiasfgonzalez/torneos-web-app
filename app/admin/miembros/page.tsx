import type { Metadata } from "next";
import { validatePanelAccess } from "@/lib/roleValidation";
import MembersClient from "./MembersClient";

export const metadata: Metadata = {
  title: "Miembros | GOLAZO Admin",
};

/**
 * Gestión de miembros e invitaciones de la organización (N6).
 * Cualquier miembro ve la lista; solo el OWNER (o admin) gestiona.
 */
export default async function MiembrosPage() {
  await validatePanelAccess();

  return <MembersClient />;
}
