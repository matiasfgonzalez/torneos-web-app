import { z } from "zod";
import { Foot, PlayerPosition, PlayerStatus } from "@prisma/client";
import {
  nullableDate,
  nullableEnum,
  nullableFloat,
  nullableInt,
  nullableString,
} from "./common";

const playerBase = z
  .object({
    name: z.string().trim().min(1).max(120),
    nationalId: nullableString(20),
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

export const playerCreateSchema = playerBase.partial().required({ name: true });
export const playerUpdateSchema = playerBase.partial();

export type PlayerCreateInput = z.infer<typeof playerCreateSchema>;
export type PlayerUpdateInput = z.infer<typeof playerUpdateSchema>;
