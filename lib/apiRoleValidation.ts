import { NextResponse } from "next/server";
import { checkUser } from "@/lib/checkUser";
import { UserRole } from "@prisma/client";
import { canManageUser } from "@/lib/userRoles";

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
 * Indica si el usuario actual puede gestionar a otro, según la jerarquía de
 * roles. La jerarquía vive en `lib/userRoles.ts` —módulo puro— para que el
 * panel use exactamente la misma: este archivo importa `next/server` y no puede
 * cruzar al cliente, que fue por lo que la UI terminó inventándose otra.
 */
export function canManageUserApi(currentUserRole: UserRole, targetUserRole: UserRole): boolean {
  return canManageUser(currentUserRole, targetUserRole);
}
