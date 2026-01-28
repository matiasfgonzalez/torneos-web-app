import { validateAdminAccess } from "@/lib/roleValidation";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ADMINISTRADOR, EDITOR y ORGANIZADOR pueden acceder a arbitros
  await validateAdminAccess(["ADMINISTRADOR", "EDITOR", "ORGANIZADOR"]);

  return <>{children}</>;
}
