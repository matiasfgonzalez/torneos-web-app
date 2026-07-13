"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { checkUser } from "@/lib/checkUser";
import { db } from "@/lib/db";
import { ADMIN_ORG_VIEW_COOKIE } from "@/lib/orgAuth";

/**
 * Activa/desactiva el modo "ver como organización" del ADMINISTRADOR (N3/N10):
 * scopea los listados del panel a esa organización (misma vista que tiene
 * su OWNER), sin tocar permisos de mutación.
 *
 * @param orgId - organización a impersonar, o `null` para salir del modo
 */
export async function setAdminOrgView(
  orgId: string | null,
): Promise<{ success: boolean; error?: string; orgName?: string }> {
  const user = await checkUser();
  if (!user || user.role !== "ADMINISTRADOR") {
    return {
      success: false,
      error: "Solo el administrador de la plataforma puede usar esta función",
    };
  }

  const store = await cookies();

  if (orgId === null) {
    store.delete(ADMIN_ORG_VIEW_COOKIE);
    revalidatePath("/admin", "layout");
    return { success: true };
  }

  const org = await db.organization.findUnique({
    where: { id: orgId },
    select: { name: true },
  });
  if (!org) {
    return { success: false, error: "Organización no encontrada" };
  }

  store.set(ADMIN_ORG_VIEW_COOKIE, orgId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  revalidatePath("/admin", "layout");
  return { success: true, orgName: org.name };
}
