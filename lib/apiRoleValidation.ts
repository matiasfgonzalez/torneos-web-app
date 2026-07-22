import { NextResponse } from "next/server";
import { checkUser } from "@/lib/checkUser";
import { UserRole } from "@prisma/client";

/**
 * Valida que el usuario actual tenga alguno de los roles requeridos.
 * Devuelve el usuario si está autorizado, o la respuesta de error si no.
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
 * Indica si el usuario actual puede gestionar a otro, según la jerarquía de roles.
 */
export function canManageUserApi(currentUserRole: UserRole, targetUserRole: UserRole): boolean {
  return ROLE_HIERARCHY[currentUserRole] > ROLE_HIERARCHY[targetUserRole];
}
