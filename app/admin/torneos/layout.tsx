import { validatePanelAccess } from "@/lib/roleValidation";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ADMINISTRADOR o cualquier miembro de una organización
  await validatePanelAccess();

  return <>{children}</>;
}
