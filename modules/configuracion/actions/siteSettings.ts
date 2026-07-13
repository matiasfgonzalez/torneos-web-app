"use server";

import { cache } from "react";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireActionRole } from "@/lib/actionRoleValidation";
import {
  siteSettingsUpdateSchema,
  type SiteSettingsUpdateInput,
} from "@/lib/validators/site-settings";
import type { SiteSettings } from "@prisma/client";

const SITE_SETTINGS_ID = "main";

// Valores iniciales: la info de contacto real que ya estaba hardcodeada en
// el footer antes de esta migración (2026-07-13) — así el primer read no
// aparece vacío. El administrador los edita desde /admin/configuracion.
const DEFAULT_SITE_SETTINGS = {
  description:
    "La plataforma líder para la gestión profesional de torneos deportivos. Organiza, gestiona y haz crecer tus competencias.",
  contactEmail: "matiasgonzalez.652@gmail.com",
  contactPhone: "+54 9 3454 432164",
  address: "Los Jilgueros 130, Oro Verde - Entre Ríos - Argentina",
};

/**
 * Configuración pública del sitio (singleton). Se crea perezosamente con
 * los valores por defecto si todavía no existe. `cache()` evita repetir la
 * query en el mismo request (el Footer se renderiza en cada página).
 */
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const existing = await db.siteSettings.findUnique({
    where: { id: SITE_SETTINGS_ID },
  });
  if (existing) return existing;

  return db.siteSettings.create({
    data: { id: SITE_SETTINGS_ID, ...DEFAULT_SITE_SETTINGS },
  });
});

export async function updateSiteSettings(
  input: SiteSettingsUpdateInput,
): Promise<{ success: boolean; error?: string }> {
  const auth = await requireActionRole(["ADMINISTRADOR"]);
  if (auth.error) return { success: false, error: auth.error };

  const parsed = siteSettingsUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Datos inválidos" };
  }

  await db.siteSettings.upsert({
    where: { id: SITE_SETTINGS_ID },
    create: { id: SITE_SETTINGS_ID, ...DEFAULT_SITE_SETTINGS, ...parsed.data },
    update: parsed.data,
  });

  revalidatePath("/", "layout");
  return { success: true };
}
