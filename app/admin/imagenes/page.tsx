import type { Metadata } from "next";
import { validatePanelAccess } from "@/lib/roleValidation";
import { findOrphans } from "@/lib/cloudinary-orphans";
import ImagenesClient from "./ImagenesClient";

export const metadata: Metadata = {
  title: "Imágenes huérfanas | GOLAZO Admin",
};

// El listado usa el Admin API de Cloudinary (rate-limited) + recorre la BD:
// nunca se prerenderiza ni cachea, siempre datos frescos.
export const dynamic = "force-dynamic";

/**
 * Gestión de imágenes huérfanas en Cloudinary (M9) — solo ADMINISTRADOR de
 * plataforma. Lista los assets de las carpetas gestionadas que ninguna fila de
 * la BD referencia y permite borrarlos para liberar espacio.
 */
export default async function ImagenesPage() {
  await validatePanelAccess({ adminOnly: true });

  const orphans = await findOrphans();

  return <ImagenesClient orphans={orphans} />;
}
