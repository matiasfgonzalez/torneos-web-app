import { NextResponse } from "next/server";
import { checkUser } from "@/lib/checkUser";
import { UserRole } from "@prisma/client";

/**
 * Validates that the current user has one of the required roles
 * Returns the user if authorized, or an error response if not
 */
export async function validateApiRole(
  requiredRoles: UserRole[]
): Promise<{ user: Awaited<ReturnType<typeof checkUser>>; error?: never } | { user?: never; error: NextResponse }> {
  const user = await checkUser();

  if (!user) {
    return {
      error: NextResponse.json(
        {
          success: false,
          error: "No autorizado",
          message: "Debes iniciar sesión para acceder a este recurso",
        },
        { status: 401 }
      ),
    };
  }

  if (!requiredRoles.includes(user.role)) {
    return {
      error: NextResponse.json(
        {
          success: false,
          error: "Permisos insuficientes",
          message: `No tienes permisos para realizar esta acción. Se requiere: ${requiredRoles.join(", ")}`,
        },
        { status: 403 }
      ),
    };
  }

  return { user };
}

/**
 * Role hierarchy for API permission checking
 * (roles de plataforma reducidos a 2 en N1; los roles de trabajo
 * viven en OrganizationMember — ver lib/orgAuth.ts)
 */
const ROLE_HIERARCHY: Record<UserRole, number> = {
  USUARIO: 1,
  ADMINISTRADOR: 2,
};

/**
 * Check if the current user can manage a target user based on hierarchy
 */
export function canManageUserApi(currentUserRole: UserRole, targetUserRole: UserRole): boolean {
  return ROLE_HIERARCHY[currentUserRole] > ROLE_HIERARCHY[targetUserRole];
}
