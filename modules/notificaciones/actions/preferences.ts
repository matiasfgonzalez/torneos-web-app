"use server";

import { revalidatePath } from "next/cache";
import type { NotificationCategory } from "@prisma/client";

import { db } from "@/lib/db";
import { checkUser } from "@/lib/checkUser";
import {
  CATEGORY_LABELS,
  NOTIFICATION_CATEGORIES,
} from "@/lib/notifications/catalog";
import type { PreferenceItem } from "@modules/notificaciones/types";

/**
 * Preferencias de notificación por usuario (S5).
 *
 * **La ausencia de fila es "todo encendido"** (ver el modelo). Por eso la
 * lectura completa los faltantes con el default en vez de crear filas: un
 * usuario que nunca tocó nada no debe tener filas, y así no hay que
 * backfillear a los que ya existen ni sembrar preferencias al registrarse.
 */
export async function getMyNotificationPreferences(): Promise<PreferenceItem[]> {
  const user = await checkUser();
  if (!user) return [];

  const saved = await db.notificationPreference.findMany({
    where: { userId: user.id },
    select: { category: true, email: true },
  });

  return NOTIFICATION_CATEGORIES.map((category) => ({
    category,
    label: CATEGORY_LABELS[category].label,
    description: CATEGORY_LABELS[category].description,
    email: saved.find((p) => p.category === category)?.email ?? true,
  }));
}

/**
 * Enciende o apaga el email de una categoría.
 *
 * Solo se toca `email`: la campana in-app no se apaga (es gratis y no
 * interrumpe). El campo `inApp` existe en el modelo por si eso cambia.
 */
export async function setEmailPreference(
  category: NotificationCategory,
  email: boolean,
): Promise<{ ok: boolean; error?: string }> {
  const user = await checkUser();
  if (!user) return { ok: false, error: "Necesitás iniciar sesión" };

  await db.notificationPreference.upsert({
    where: { userId_category: { userId: user.id, category } },
    create: { userId: user.id, category, email },
    update: { email },
  });

  revalidatePath("/notificaciones");
  return { ok: true };
}
