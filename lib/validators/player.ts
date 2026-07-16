import { z } from "zod";
import { Foot, PlayerPosition, PlayerStatus } from "@prisma/client";
import {
  nullableDate,
  nullableEnum,
  nullableFloat,
  nullableInt,
  nullableString,
} from "./common";

/**
 * DNI — la clave de identidad global del jugador (N12).
 *
 * Obligatorio y único en toda la plataforma: es lo único que evita que dos
 * delegados carguen a la misma persona dos veces. Se normaliza (sin puntos ni
 * espacios) para que "12.345.678" y "12345678" sean el mismo documento — si no,
 * el índice único no sirve de nada.
 */
export const nationalIdSchema = z
  .string()
  .transform((value) => value.replace(/[.\s-]/g, "").trim())
  .pipe(
    z
      .string()
      .min(6, "El DNI debe tener al menos 6 dígitos")
      .max(20)
      .regex(/^[0-9A-Za-z]+$/, "El DNI solo puede tener números y letras"),
  );

const playerBase = z
  .object({
    name: z.string().trim().min(1).max(120),
    nationalId: nationalIdSchema,
    birthDate: nullableDate(),
    birthPlace: nullableString(120),
    nationality: nullableString(80),
    height: nullableFloat(0, 300),
    weight: nullableFloat(0, 500),
    dominantFoot: nullableEnum(Foot),
    position: nullableEnum(PlayerPosition),
    number: nullableInt(0, 999),
    imageUrl: nullableString(500),
    imagePublicId: nullableString(255),
    imageUrlFace: nullableString(500),
    imageFacePublicId: nullableString(255),
    description: nullableString(1000),
    bio: nullableString(5000),
    status: z.enum(PlayerStatus),
    joinedAt: nullableDate(),
    instagramUrl: nullableString(255),
    twitterUrl: nullableString(255),
  });

// El DNI es obligatorio al crear (decisión del owner 2026-07-14): sin él no hay
// identidad ni dedupe posible.
export const playerCreateSchema = playerBase
  .partial()
  .required({ name: true, nationalId: true });

export const playerUpdateSchema = playerBase.partial();

export type PlayerCreateInput = z.infer<typeof playerCreateSchema>;
export type PlayerUpdateInput = z.infer<typeof playerUpdateSchema>;
