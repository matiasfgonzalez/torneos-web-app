import { validateAdminAccess } from "@/lib/roleValidation";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Solo ADMINISTRADOR puede acceder a la sección de usuarios
  await validateAdminAccess(["ADMINISTRADOR"]);

  return <>{children}</>;
}
