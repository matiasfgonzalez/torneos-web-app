import { z } from "zod";
import {
  AgeGroup,
  Gender,
  TournamentFormat,
  TournamentStatus,
} from "@prisma/client";
import { nullableString } from "./common";
import { TIEBREAKER_CRITERIA } from "@/lib/standings/config";

// Fechas date-only ("2025-07-01") se interpretan en hora local, no UTC,
// para no correr el día por zona horaria
const localDate = z.preprocess(
  (value) =>
    typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? `${value}T00:00:00`
      : value,
  z.coerce.date(),
);

const nullableLocalDate = z.preprocess(
  (value) => (value === "" || value === undefined || value === null ? null : value),
  z.union([
    z.null(),
    z.preprocess(
      (value) =>
        typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
          ? `${value}T00:00:00`
          : value,
      z.coerce.date(),
    ),
  ]),
);

const tournamentBase = z.object({
  name: z.string().trim().min(1).max(150),
  description: nullableString(2000),
  // Categoría en 3 campos (M13): ageGroup + gender + division
  ageGroup: z.enum(AgeGroup),
  gender: z.enum(Gender),
  division: nullableString(30),
  locality: z.string().trim().min(1).max(120),
  logoUrl: nullableString(500),
  logoPublicId: nullableString(255),
  liga: nullableString(120),
  format: z.enum(TournamentFormat),
  nextMatch: nullableLocalDate,
  homeAndAway: z.boolean(),
  startDate: localDate,
  endDate: nullableLocalDate,
  status: z.enum(TournamentStatus),
  enabled: z.boolean(),
  rules: nullableString(20000),
  trophy: nullableString(500),
  // Configuración deportiva (N7): puntaje, walkover y desempates
  pointsWin: z.coerce.number().int().min(0).max(10),
  pointsDraw: z.coerce.number().int().min(0).max(10),
  pointsLoss: z.coerce.number().int().min(-10).max(10),
  walkoverScore: z.coerce.number().int().min(0).max(20),
  tiebreakers: z.array(z.enum(TIEBREAKER_CRITERIA)).min(1).max(5),
  // Sanciones automáticas (N8): 0 desactiva
  yellowsForSuspension: z.coerce.number().int().min(0).max(50),
  matchesPerRedCard: z.coerce.number().int().min(0).max(20),
});

// status/enabled se fijan server-side al crear; ageGroup/gender y la config
// deportiva tienen default en Prisma (LIBRE/MASCULINO/3-1-0)
export const tournamentCreateSchema = tournamentBase
  .omit({ status: true, enabled: true })
  .partial({
    description: true,
    ageGroup: true,
    gender: true,
    division: true,
    logoUrl: true,
    logoPublicId: true,
    liga: true,
    nextMatch: true,
    homeAndAway: true,
    endDate: true,
    rules: true,
    trophy: true,
    pointsWin: true,
    pointsDraw: true,
    pointsLoss: true,
    walkoverScore: true,
    tiebreakers: true,
    yellowsForSuspension: true,
    matchesPerRedCard: true,
  });

export const tournamentUpdateSchema = tournamentBase.partial();

export type TournamentCreateInput = z.infer<typeof tournamentCreateSchema>;
export type TournamentUpdateInput = z.infer<typeof tournamentUpdateSchema>;
