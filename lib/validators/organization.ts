import { z } from "zod";
import { nullableString } from "./common";

/**
 * Validadores del perfil de organización y de miembros/invitaciones (N6).
 */

export const organizationUpdateSchema = z
  .object({
    name: z.string().trim().min(2).max(100),
    locality: nullableString(120),
    description: nullableString(500),
    phone: nullableString(30),
    logoUrl: nullableString(500),
    logoPublicId: nullableString(255),
  })
  .partial()
  .strict();

// OWNER no se invita: es quien creó la liga. Solo roles de trabajo.
export const inviteMemberSchema = z
  .object({
    email: z.string().trim().toLowerCase().email().max(255),
    role: z.enum(["ORGANIZADOR", "COLABORADOR"]),
  })
  .strict();

export const memberRoleSchema = z
  .object({
    role: z.enum(["ORGANIZADOR", "COLABORADOR"]),
  })
  .strict();

// Suspender/reactivar una organización (admin de plataforma, N10)
export const organizationStatusSchema = z
  .object({
    status: z.enum(["ACTIVA", "SUSPENDIDA"]),
  })
  .strict();

export type OrganizationUpdateInput = z.infer<typeof organizationUpdateSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type OrganizationStatusInput = z.infer<typeof organizationStatusSchema>;
