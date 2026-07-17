import { z } from "zod";

/**
 * CRUD de planes para el admin de plataforma (N10).
 * `code` identifica el plan en la lógica de negocio (getFreePlan() busca
 * "FREE" por código) — no se permite renombrarlo una vez creado.
 */
export const planCreateSchema = z
  .object({
    code: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z0-9_]{2,20}$/, "Solo mayúsculas, números y guión bajo"),
    name: z.string().trim().min(2).max(60),
    priceMonthly: z.coerce.number().min(0).max(999999),
    currency: z.string().trim().min(3).max(3).default("ARS"),
    maxActiveTournaments: z.coerce.number().int().min(0).max(999),
    maxTeamsPerTournament: z.coerce.number().int().min(0).max(999),
    maxMembers: z.coerce.number().int().min(0).max(999),
    features: z.object({
      exportPdf: z.boolean().default(false),
      customBranding: z.boolean().default(false),
      liveMatch: z.boolean().default(false),
      orgNews: z.boolean().default(false),
    }),
    isActive: z.boolean().default(true),
    order: z.coerce.number().int().min(0).max(999).default(0),
  })
  .strict();

export const planUpdateSchema = planCreateSchema
  .omit({ code: true })
  .partial()
  .strict();

export type PlanCreateInput = z.infer<typeof planCreateSchema>;
export type PlanUpdateInput = z.infer<typeof planUpdateSchema>;
