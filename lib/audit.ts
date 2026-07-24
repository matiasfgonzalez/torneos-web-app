import "server-only";

import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

// Constantes/etiquetas client-safe (las usa también la tabla client). Se
// re-exportan para que el server siga importando todo desde `@/lib/audit`.
export {
  AuditAction,
  AuditEntity,
  AUDIT_ACTION_LABELS,
  AUDIT_ENTITY_LABELS,
  type AuditActionType,
  type AuditEntityType,
} from "@/lib/audit-constants";

/**
 * Registro de auditoría (M8). El modelo `AuditLog` existía sin uso; acá se
 * centraliza la escritura de las **mutaciones sensibles** (cambio de rol, baja
 * de torneo, edición de resultado, suspensión de organización…).
 *
 * Reglas:
 * - `userId` es **quién hace la acción** (el actor), no el recurso afectado. El
 *   detalle de usuario (`/admin/usuarios/[id]`) muestra "acciones realizadas por
 *   el usuario", así que tiene que ser el actor.
 * - El registro **nunca** debe romper la mutación que lo dispara: si el insert
 *   falla, se loguea y sigue.
 */

interface AuditInput {
  /** Quién realiza la acción (id de `User`). `null` si no hay sesión. */
  actorId?: string | null;
  action: string;
  entity: string;
  entityId: string;
  /** Datos del cambio (qué campos, valores nuevos, motivo…). */
  payload?: Prisma.InputJsonValue;
}

/**
 * Escribe una entrada de auditoría. No lanza: envuelve el insert en try/catch
 * para que un fallo de auditoría no tumbe la operación de negocio.
 */
export async function logAudit(input: AuditInput): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        userId: input.actorId ?? null,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId,
        payload: input.payload,
      },
    });
  } catch (err) {
    console.error("[audit] no se pudo registrar la acción:", err);
  }
}
