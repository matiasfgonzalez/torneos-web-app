import type { Metadata } from "next";
import { validatePanelAccess } from "@/lib/roleValidation";
import PlanesClient from "./PlanesClient";

export const metadata: Metadata = {
  title: "Planes | GOLAZO Admin",
};

/**
 * CRUD de planes (N10): precio, límites y features de cada plan que
 * contratan las organizaciones. Solo ADMINISTRADOR.
 */
export default async function PlanesPage() {
  await validatePanelAccess({ adminOnly: true });

  return <PlanesClient />;
}
