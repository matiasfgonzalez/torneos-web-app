import { UserRole } from "@prisma/client";
import { checkUser } from "./checkUser";
import { db } from "./db";
import { acceptPendingInvites } from "./orgAuth";
import { redirect } from "next/navigation";

/**
 * Jerarquía de roles de PLATAFORMA (reducidos a 2 en N1).
 * El rol de trabajo (OWNER/ORGANIZADOR/COLABORADOR) vive en
 * OrganizationMember — ver lib/orgAuth.ts.
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  USUARIO: 1,
  ADMINISTRADOR: 2,
};

export function canManageUser(
  currentUserRole: UserRole,
  targetUserRole: UserRole,
): boolean {
  return ROLE_HIERARCHY[currentUserRole] > ROLE_HIERARCHY[targetUserRole];
}

export function canAssignRole(
  currentUserRole: UserRole,
  targetRole: UserRole,
): boolean {
  return ROLE_HIERARCHY[currentUserRole] > ROLE_HIERARCHY[targetRole];
}

/**
 * Guard server-side para páginas del panel.
 *
 * - `adminOnly: true` → solo ADMINISTRADOR (usuarios, noticias, config, stats)
 * - default → ADMINISTRADOR o cualquier miembro de una organización
 *   (OWNER/ORGANIZADOR/COLABORADOR)
 */
export async function validatePanelAccess(
  opts: { adminOnly?: boolean } = {},
  redirectPath: string = "/",
) {
  const user = await checkUser();

  if (!user) {
    redirect("/sign-in");
  }

  if (user.role === "ADMINISTRADOR") {
    return user;
  }

  if (opts.adminOnly) {
    redirect(redirectPath);
  }

  const membership = await db.organizationMember.findFirst({
    where: { userId: user.id },
    select: { id: true },
  });

  if (!membership) {
    // ¿Fue invitado a una liga? Aceptar la invitación y dejarlo entrar (N6)
    const accepted = await acceptPendingInvites(user);
    if (accepted === 0) {
      // Sin liga. Antes esto mandaba a todos a "Creá tu liga", que a un
      // delegado le ofrece el producto equivocado (N13): si representa a un
      // equipo, su lugar es /mi-equipo. Solo el que no es ninguna de las dos
      // cosas entra al funnel de onboarding.
      const managership = await db.teamManager.findFirst({
        where: { userId: user.id },
        select: { id: true },
      });
      redirect(managership ? "/mi-equipo" : "/bienvenida");
    }
  }

  return user;
}
