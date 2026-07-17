/**
 * Notificaciones (S5). Punto de entrada único:
 *
 *   import { notify, getOrgManagerIds } from "@/lib/notifications";
 *
 * - `catalog.ts` — puro: qué dice y adónde lleva cada notificación (testeado).
 * - `dispatch.ts` — `notify()` + resolución de destinatarios por rol.
 * - `email.ts`    — envío por Resend (no-op sin RESEND_API_KEY).
 */
export {
  renderNotification,
  NOTIFICATION_CATEGORY,
  NOTIFICATION_CATEGORIES,
  CATEGORY_LABELS,
  type NotificationPayload,
  type RenderedNotification,
} from "@/lib/notifications/catalog";

export {
  notify,
  getOrgManagerIds,
  getOrgOwnerId,
  getTeamManagerIds,
  getTeamManagerIdsForTeams,
  getPlatformAdminIds,
  getPlayerOwnerId,
} from "@/lib/notifications/dispatch";

export { isEmailEnabled, appUrl } from "@/lib/notifications/email";
