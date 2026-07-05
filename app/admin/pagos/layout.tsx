import { validatePanelAccess } from "@/lib/roleValidation";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Solo ADMINISTRADOR (aprobación de pagos de la plataforma)
  await validatePanelAccess({ adminOnly: true });

  return <>{children}</>;
}
