import type { NotificationCategory, NotificationType } from "@prisma/client";

/** Una notificación tal como la consume la UI (fechas ya serializadas). */
export interface NotificationItem {
  id: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  body: string | null;
  url: string | null;
  readAt: string | null;
  createdAt: string;
}

/** Preferencia de una categoría, con sus etiquetas ya resueltas para la UI. */
export interface PreferenceItem {
  category: NotificationCategory;
  label: string;
  description: string;
  email: boolean;
}
