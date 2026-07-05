import { z } from "zod";
import { nullableString } from "./common";

const currentYear = new Date().getFullYear();

const yearFounded = z.coerce.number().int().min(1900).max(currentYear);

const teamBase = z.object({
  name: z.string().trim().min(1).max(120),
  shortName: nullableString(30),
  description: nullableString(1000),
  history: nullableString(5000),
  coach: nullableString(120),
  homeCity: nullableString(120),
  yearFounded,
  homeColor: nullableString(30),
  awayColor: nullableString(30),
  logoUrl: nullableString(500),
  logoPublicId: nullableString(255),
});

export const teamCreateSchema = teamBase.partial({
  shortName: true,
  description: true,
  history: true,
  coach: true,
  homeCity: true,
  homeColor: true,
  awayColor: true,
  logoUrl: true,
  logoPublicId: true,
});

export const teamUpdateSchema = teamBase.partial();

export type TeamCreateInput = z.infer<typeof teamCreateSchema>;
export type TeamUpdateInput = z.infer<typeof teamUpdateSchema>;
