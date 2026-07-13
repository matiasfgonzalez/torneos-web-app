import type React from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { OrgViewBanner } from "@/components/admin/OrgViewBanner";
import { checkUser } from "@/lib/checkUser";
import { getAdminOrgView } from "@/lib/orgAuth";
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

  // Modo "ver como organización" del ADMINISTRADOR (N3)
  const orgView = await getAdminOrgView(userLogued);

  return (
    <AdminShell
      role={userLogued.role}
      banner={orgView ? <OrgViewBanner orgName={orgView.org?.name ?? null} /> : null}
    >
      {children}
    </AdminShell>
  );
}
