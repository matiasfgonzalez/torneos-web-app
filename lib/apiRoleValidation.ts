import type { NextResponse } from "next/server";

import { checkUser } from "@/lib/checkUser";
import { apiError } from "@/lib/apiResponse";
import { UserRole } from "@/lib/generated/prisma/enums";
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
      // A7: `{ error }`, no `{ success:false, error, message }`. Era el último
      // envelope del repo, y el más caro: lo devuelve la guarda que usan todas
      // las rutas de admin, así que su forma marcaba a media API.
      error: apiError(401, "Debes iniciar sesión para acceder a este recurso"),
    };
  }

  if (!requiredRoles.includes(user.role)) {
    return {
      error: apiError(
        403,
        `No tienes permisos para realizar esta acción. Se requiere: ${requiredRoles.join(", ")}`,
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
