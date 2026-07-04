import { z } from "zod";
import { NextResponse } from "next/server";

// Los formularios envían "" en campos vacíos; se normaliza antes de validar
const emptyToNull = (value: unknown) =>
  value === "" || value === undefined || value === null ? null : value;

export const emptyToUndefined = (value: unknown) =>
  value === "" || value === null || value === undefined ? undefined : value;

export const nullableString = (max: number) =>
  z.preprocess(emptyToNull, z.union([z.null(), z.string().trim().max(max)]));

export const nullableInt = (min: number, max: number) =>
  z.preprocess(
    emptyToNull,
    z.union([z.null(), z.coerce.number().int().min(min).max(max)]),
  );

export const nullableFloat = (min: number, max: number) =>
  z.preprocess(
    emptyToNull,
    z.union([z.null(), z.coerce.number().min(min).max(max)]),
  );

export const nullableDate = () =>
  z.preprocess(emptyToNull, z.union([z.null(), z.coerce.date()]));

export const nullableEnum = <T extends Record<string, string>>(values: T) =>
  z.preprocess(emptyToNull, z.union([z.null(), z.enum(values)]));

export function validationErrorResponse(error: z.ZodError) {
  return NextResponse.json(
    {
      error: "Datos inválidos",
      details: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    },
    { status: 400 },
  );
}
