import { checkUser } from "@/lib/checkUser";
import { UserRole } from "@prisma/client";

type ActionAuthResult =
  | { user: NonNullable<Awaited<ReturnType<typeof checkUser>>>; error?: never }
  | { user?: never; error: string };

/**
 * Guard de roles para server actions (equivalente a validateApiRole para rutas).
 * Devuelve un objeto plano serializable: las actions retornan
 * `{ success: false, error }` en vez de NextResponse.
 *
 * Uso:
 * ```ts
 * const auth = await requireActionRole(["ADMINISTRADOR", "EDITOR", "ORGANIZADOR"]);
 * if (auth.error) return { success: false, error: auth.error };
 * ```
 */
export async function requireActionRole(
  requiredRoles: UserRole[],
): Promise<ActionAuthResult> {
  const user = await checkUser();

  if (!user) {
    return { error: "Debes iniciar sesión para realizar esta acción" };
  }

  if (!requiredRoles.includes(user.role)) {
    return { error: "No tienes permisos para realizar esta acción" };
  }

  return { user };
}
