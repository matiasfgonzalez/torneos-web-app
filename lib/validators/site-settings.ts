import { z } from "zod";
import { nullableString } from "./common";

/**
 * Configuración pública del sitio (contacto/redes del Footer), editable por
 * el ADMINISTRADOR desde /admin/configuracion.
 */
export const siteSettingsUpdateSchema = z
  .object({
    description: nullableString(300),
    contactEmail: z.preprocess(
      (v) => (v === "" ? null : v),
      z.union([z.null(), z.string().trim().toLowerCase().email().max(255)]),
    ),
    contactPhone: nullableString(30),
    address: nullableString(200),
    facebookUrl: z.preprocess(
      (v) => (v === "" ? null : v),
      z.union([z.null(), z.string().trim().url().max(300)]),
    ),
    twitterUrl: z.preprocess(
      (v) => (v === "" ? null : v),
      z.union([z.null(), z.string().trim().url().max(300)]),
    ),
    instagramUrl: z.preprocess(
      (v) => (v === "" ? null : v),
      z.union([z.null(), z.string().trim().url().max(300)]),
    ),
    // Datos de cobro para pagos manuales (N5)
    paymentAlias: nullableString(120),
    paymentHolder: nullableString(120),
    paymentInstructions: nullableString(500),
  })
  .partial()
  .strict();

export type SiteSettingsUpdateInput = z.infer<typeof siteSettingsUpdateSchema>;
