/**
 * Constantes y etiquetas de auditoría (M8) — **client-safe**.
 *
 * Viven separadas de [lib/audit.ts](audit.ts) porque ese módulo es `server-only`
 * (usa `db`): la tabla de `/admin/auditoria` es un client component y necesita
 * las etiquetas/enums, pero no puede importar nada `server-only`.
 */

/** Acciones auditadas. String libre en la BD, pero acotado acá para consistencia. */
export const AuditAction = {
  ROLE_CHANGE: "ROLE_CHANGE",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
  RESTORE: "RESTORE",
  STATUS_CHANGE: "STATUS_CHANGE",
  MATCH_RESULT: "MATCH_RESULT",
} as const;

export type AuditActionType = (typeof AuditAction)[keyof typeof AuditAction];

/** Entidades auditadas. */
export const AuditEntity = {
  USER: "User",
  TOURNAMENT: "Tournament",
  MATCH: "Match",
  ORGANIZATION: "Organization",
} as const;

export type AuditEntityType = (typeof AuditEntity)[keyof typeof AuditEntity];

/** Etiquetas legibles (UI) para acciones y entidades. */
export const AUDIT_ACTION_LABELS: Record<string, string> = {
  ROLE_CHANGE: "Cambio de rol",
  UPDATE: "Edición",
  DELETE: "Eliminación",
  RESTORE: "Restauración",
  STATUS_CHANGE: "Cambio de estado",
  MATCH_RESULT: "Carga de resultado",
};

export const AUDIT_ENTITY_LABELS: Record<string, string> = {
  User: "Usuario",
  Tournament: "Torneo",
  Match: "Partido",
  Organization: "Organización",
};
