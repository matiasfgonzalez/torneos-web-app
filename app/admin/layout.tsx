import type React from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { OrgViewBanner } from "@/components/admin/OrgViewBanner";
import { checkUser } from "@/lib/checkUser";
import { getAdminOrgView, getMyOrgRole } from "@/lib/orgAuth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userLogued = await checkUser();

  if (!userLogued) {
    // Redirige si no está autenticado (aunque Clerk ya lo hace desde el middleware)
    redirect("/sign-in");
  }

  // Modo "ver como organización" del ADMINISTRADOR (N3) + rol de org (N14c:
  // el sidebar/palette ocultan Plan/Miembros a quien no es OWNER)
  const [orgView, orgRole] = await Promise.all([
    getAdminOrgView(userLogued),
    getMyOrgRole(userLogued),
  ]);

  return (
    <AdminShell
      role={userLogued.role}
      orgRole={orgRole}
      banner={orgView ? <OrgViewBanner orgName={orgView.org?.name ?? null} /> : null}
    >
      {children}
    </AdminShell>
  );
}
