"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { checkUser } from "@/lib/checkUser";
import type { NotificationItem } from "@modules/notificaciones/types";

/**
 * Lectura de la campana (S5).
 *
 * Todo se acota por `userId` de la sesión, nunca por un id que venga del
 * cliente: una notificación es del usuario y de nadie más, así que no hay
 * "¿puede ver esta?" — hay "las suyas".
 */

/** Cuántas hay sin leer. Es la query más caliente: la campana la pide sola. */
export async function getUnreadCount(): Promise<number> {
  const user = await checkUser();
  if (!user) return 0;

  return db.notification.count({
    where: { userId: user.id, readAt: null },
  });
}

/**
 * Últimas notificaciones del usuario.
 * @param limit - la campana pide 8; la página, 50.
 */
export async function getMyNotifications(limit = 8): Promise<NotificationItem[]> {
  const user = await checkUser();
  if (!user) return [];

  const rows = await db.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: Math.min(limit, 50),
    select: {
      id: true,
      type: true,
      category: true,
      title: true,
      body: true,
      url: true,
      readAt: true,
      createdAt: true,
    },
  });

  // Las fechas cruzan a un componente cliente: se serializan acá.
  return rows.map((n) => ({
    ...n,
    readAt: n.readAt?.toISOString() ?? null,
    createdAt: n.createdAt.toISOString(),
  }));
}

/** Marca una como leída. `updateMany` con el userId: nadie lee la de otro. */
export async function markAsRead(id: string): Promise<{ ok: boolean }> {
  const user = await checkUser();
  if (!user) return { ok: false };

  await db.notification.updateMany({
    where: { id, userId: user.id, readAt: null },
    data: { readAt: new Date() },
  });

  revalidatePath("/notificaciones");
  return { ok: true };
}

/** Marca todas como leídas. */
export async function markAllAsRead(): Promise<{ ok: boolean; count: number }> {
  const user = await checkUser();
  if (!user) return { ok: false, count: 0 };

  const result = await db.notification.updateMany({
    where: { userId: user.id, readAt: null },
    data: { readAt: new Date() },
  });

  revalidatePath("/notificaciones");
  return { ok: true, count: result.count };
}
