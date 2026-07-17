import { z } from "zod";

/**
 * Novedad de la liga (S12). Validación server de las mutaciones de OrgPost.
 * El título y el contenido son obligatorios; el resumen y la portada, opcionales.
 */
export const orgPostCreateSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "El título debe tener al menos 3 caracteres")
      .max(160, "El título no puede superar los 160 caracteres"),
    summary: z
      .string()
      .trim()
      .max(300, "El resumen no puede superar los 300 caracteres")
      .nullish(),
    content: z
      .string()
      .trim()
      .min(1, "El contenido no puede estar vacío")
      .max(10000, "El contenido no puede superar los 10.000 caracteres"),
    coverImageUrl: z.string().url("URL de portada inválida").nullish(),
    coverImagePublicId: z.string().max(300).nullish(),
    published: z.boolean().default(false),
  })
  .strict();

export const orgPostUpdateSchema = orgPostCreateSchema.partial().strict();

export type OrgPostCreateInput = z.infer<typeof orgPostCreateSchema>;
export type OrgPostUpdateInput = z.infer<typeof orgPostUpdateSchema>;
