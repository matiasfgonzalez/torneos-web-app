import { validatePanelAccess } from "@/lib/roleValidation";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Recurso por organización: admin de plataforma o miembro de una organización.
  await validatePanelAccess();

  return <>{children}</>;
}
