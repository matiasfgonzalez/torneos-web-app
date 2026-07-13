import type { Metadata } from "next";
import { validatePanelAccess } from "@/lib/roleValidation";
import { getSiteSettings } from "@modules/configuracion/actions/siteSettings";
import ConfiguracionClient from "./ConfiguracionClient";

export const metadata: Metadata = {
  title: "Configuración | GOLAZO Admin",
};

/**
 * Información pública del sitio (contacto/redes del Footer), editable sin
 * redeploy. Solo ADMINISTRADOR.
 */
export default async function ConfiguracionPage() {
  await validatePanelAccess({ adminOnly: true });
  const settings = await getSiteSettings();

  return <ConfiguracionClient initialSettings={settings} />;
}
