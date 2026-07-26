import type { UserRole } from "@prisma/client";

/**
 * Jerarquía de roles de **plataforma** — pura, sin Next ni base, para que la
 * usen igual el server (`apiRoleValidation`) y el panel (client components).
 *
 * Los roles de plataforma son **dos** (decisión D5 / N1): `ADMINISTRADOR` es el
 * dueño del producto y `USUARIO` es el resto. El rol de trabajo —quién
 * gestiona qué liga— no vive acá: es `OrganizationMember.role`
 * (OWNER / ORGANIZADOR / COLABORADOR) y se administra en `/admin/miembros`.
 *
 * **Por qué existe este archivo:** había dos jerarquías. Esta, correcta, dentro
 * de `lib/apiRoleValidation.ts` (que además importa `next/server`, así que la UI
 * no podía tocarla); y otra en `app/admin/usuarios/types.ts` con **cinco**
 * roles inventados —MODERADOR, EDITOR, ORGANIZADOR— que la base no puede
 * guardar. El panel ofrecía esos roles en sus filtros y selectores. Con la
 * jerarquía separada en un módulo puro, server y UI comparten la única real.
 */

/** Peso de cada rol: mayor gestiona a menor. */
export const USER_ROLE_RANK: Record<UserRole, number> = {
  USUARIO: 1,
  ADMINISTRADOR: 2,
};

/**
 * ¿`actor` puede gestionar (editar/eliminar) a `target`?
 *
 * Estrictamente mayor: un ADMINISTRADOR no edita ni elimina a otro
 * ADMINISTRADOR — es lo que evita que dos admins se borren entre sí.
 */
export function canManageUser(actor: UserRole, target: UserRole): boolean {
  return USER_ROLE_RANK[actor] > USER_ROLE_RANK[target];
}

/**
 * ¿`actor` puede **asignar** el rol `target` a alguien?
 *
 * Solo el ADMINISTRADOR reparte roles de plataforma, y puede asignar
 * cualquiera de los dos (incluido promover a otro ADMINISTRADOR: si no, no
 * habría forma de sumar un segundo dueño del producto).
 */
export function canAssignRole(actor: UserRole, target: UserRole): boolean {
  // `target in USER_ROLE_RANK` no es ceremonia: el valor llega de un `<select>`
  // y, si alguna vista vuelve a ofrecer un rol que el enum no tiene, acá se
  // corta en vez de mandarlo al PATCH para que lo rechace el validador.
  return actor === "ADMINISTRADOR" && target in USER_ROLE_RANK;
}
