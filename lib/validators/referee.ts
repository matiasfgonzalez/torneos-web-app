import { z } from "zod";
import { RefereeStatus } from "@prisma/client";
import { nullableDate, nullableString } from "./common";

const emptyToNull = (value: unknown) =>
  value === "" || value === undefined || value === null ? null : value;

const nullableEmail = z.preprocess(
  emptyToNull,
  z.union([z.null(), z.email().max(255)]),
);

const refereeBase = z.object({
  name: z.string().trim().min(1).max(120),
  email: nullableEmail,
  phone: nullableString(30),
  nationalId: nullableString(30),
  birthDate: nullableDate(),
  nationality: nullableString(80),
  imageUrl: nullableString(500),
  certificationLevel: nullableString(120),
  status: z.enum(RefereeStatus),
  enabled: z.boolean(),
});

// status/enabled se fijan server-side al crear
export const refereeCreateSchema = refereeBase
  .omit({ status: true, enabled: true })
  .partial({
    email: true,
    phone: true,
    nationalId: true,
    birthDate: true,
    nationality: true,
    imageUrl: true,
    certificationLevel: true,
  });

export const refereeUpdateSchema = refereeBase.partial();

export type RefereeCreateInput = z.infer<typeof refereeCreateSchema>;
export type RefereeUpdateInput = z.infer<typeof refereeUpdateSchema>;
