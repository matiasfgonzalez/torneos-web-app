/**
 * Módulo de notificaciones (S5) — el lado del **usuario**: leer la campana y
 * elegir qué le llega por mail.
 *
 * El lado del **emisor** vive en `lib/notifications` (`notify()`): una acción
 * que aprueba una inscripción no importa este módulo, importa el despachador.
 */
export {
  getMyNotifications,
  getUnreadCount,
  markAllAsRead,
  markAsRead,
} from "@modules/notificaciones/actions/notifications";

export {
  getMyNotificationPreferences,
  setEmailPreference,
} from "@modules/notificaciones/actions/preferences";

export { NotificationBell } from "@modules/notificaciones/components/NotificationBell";
export { NotificationList } from "@modules/notificaciones/components/NotificationList";
export { NotificationPreferences } from "@modules/notificaciones/components/NotificationPreferences";
export { NotificationRow } from "@modules/notificaciones/components/NotificationRow";
export { relativeTime } from "@modules/notificaciones/lib/relativeTime";

export type {
  NotificationItem,
  PreferenceItem,
} from "@modules/notificaciones/types";
