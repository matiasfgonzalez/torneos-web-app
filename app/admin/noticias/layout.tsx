import { validateAdminAccess } from "@/lib/roleValidation";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ADMINISTRADOR y EDITOR pueden acceder a noticias
  await validateAdminAccess(["ADMINISTRADOR", "EDITOR"]);

  return <>{children}</>;
}
