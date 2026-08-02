import { describe, expect, it } from "vitest";
import { z } from "zod";
import { Foot } from "@/lib/generated/prisma/enums";
import {
  emptyToUndefined,
  nullableDate,
  nullableEnum,
  nullableFloat,
  nullableInt,
  nullableString,
  validationErrorResponse,
} from "@/lib/validators/common";

/**
 * A8 — tests de los validadores Zod.
 *
 * `common.ts` es la base de casi todos los esquemas del repo: si `nullableString`
 * dejara de convertir `""` a `null`, cada formulario guardaría cadenas vacías en
 * columnas nullable (y `"" !== null` para toda la UI que hace `valor ?? "—"`).
 * Son cuatro funciones de tres líneas, y justamente por eso nadie las mira: este
 * archivo fija su comportamiento.
 */

describe("nullableString", () => {
  const schema = nullableString(10);

  it('convierte "" a null (los formularios mandan vacío, no null)', () => {
    expect(schema.parse("")).toBeNull();
  });

  it("acepta null y undefined y los normaliza a null", () => {
    expect(schema.parse(null)).toBeNull();
    expect(schema.parse(undefined)).toBeNull();
  });

  it("recorta espacios antes de guardar", () => {
    expect(schema.parse("  hola  ")).toBe("hola");
  });

  it("un valor de solo espacios queda vacío, no null", () => {
    // Se recorta *después* del preprocess, así que "   " no entra por la rama
    // de vacío: termina como "". Documentado a propósito — es el caso que hace
    // que un campo "en blanco" no siempre sea `null` en la base.
    expect(schema.parse("   ")).toBe("");
  });

  it("rechaza por encima del máximo (ya recortado)", () => {
    expect(schema.safeParse("12345678901").success).toBe(false);
    expect(schema.safeParse("  1234567890  ").success).toBe(true);
  });

  it("rechaza tipos que no son texto", () => {
    expect(schema.safeParse(42).success).toBe(false);
    expect(schema.safeParse({}).success).toBe(false);
  });
});

describe("nullableInt", () => {
  const schema = nullableInt(0, 99);

  it('convierte "" a null', () => {
    expect(schema.parse("")).toBeNull();
  });

  it("coerciona el texto del formulario a número", () => {
    expect(schema.parse("7")).toBe(7);
  });

  it("respeta los límites", () => {
    expect(schema.safeParse(0).success).toBe(true);
    expect(schema.safeParse(99).success).toBe(true);
    expect(schema.safeParse(-1).success).toBe(false);
    expect(schema.safeParse(100).success).toBe(false);
  });

  it("rechaza decimales (es un entero)", () => {
    expect(schema.safeParse(1.5).success).toBe(false);
  });

  it("rechaza texto que no es un número", () => {
    expect(schema.safeParse("dos").success).toBe(false);
  });
});

describe("nullableFloat", () => {
  const schema = nullableFloat(0, 300);

  it("acepta decimales (altura, peso)", () => {
    expect(schema.parse("1.85")).toBe(1.85);
  });

  it('convierte "" a null y respeta los límites', () => {
    expect(schema.parse("")).toBeNull();
    expect(schema.safeParse(300.1).success).toBe(false);
    expect(schema.safeParse(-0.1).success).toBe(false);
  });
});

describe("nullableDate", () => {
  const schema = nullableDate();

  it('convierte "" a null', () => {
    expect(schema.parse("")).toBeNull();
  });

  it("coerciona una fecha ISO a Date", () => {
    const parsed = schema.parse("2025-03-01T15:30:00.000Z");
    expect(parsed).toBeInstanceOf(Date);
    expect((parsed as Date).toISOString()).toBe("2025-03-01T15:30:00.000Z");
  });

  it("rechaza una fecha inválida en vez de guardar Invalid Date (C3)", () => {
    expect(schema.safeParse("no-es-una-fecha").success).toBe(false);
  });
});

describe("nullableEnum", () => {
  const schema = nullableEnum(Foot);

  it("acepta un valor del enum", () => {
    expect(schema.parse("DERECHA")).toBe("DERECHA");
  });

  it('convierte "" a null', () => {
    expect(schema.parse("")).toBeNull();
  });

  it("rechaza un valor que no está en el enum", () => {
    expect(schema.safeParse("TERCERA").success).toBe(false);
  });
});

describe("emptyToUndefined", () => {
  it("manda vacío/null/undefined a undefined (para que Prisma aplique @default)", () => {
    expect(emptyToUndefined("")).toBeUndefined();
    expect(emptyToUndefined(null)).toBeUndefined();
    expect(emptyToUndefined(undefined)).toBeUndefined();
  });

  it("deja pasar cualquier otro valor sin tocarlo", () => {
    expect(emptyToUndefined("2025-01-01")).toBe("2025-01-01");
    expect(emptyToUndefined(0)).toBe(0);
    expect(emptyToUndefined(false)).toBe(false);
  });
});

describe("validationErrorResponse", () => {
  const schema = z.object({
    name: z.string().min(1),
    scores: z.object({ home: z.number() }),
  });

  it("devuelve 400 con el detalle por campo", async () => {
    const result = schema.safeParse({ name: "", scores: { home: "x" } });
    expect(result.success).toBe(false);
    if (result.success) return;

    const response = validationErrorResponse(result.error);
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.error).toBe("Datos inválidos");
    // El path viene aplanado con puntos: es lo que el formulario necesita para
    // marcar el campo exacto, incluso anidado.
    expect(body.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: "name" }),
        expect.objectContaining({ path: "scores.home" }),
      ]),
    );
    for (const detalle of body.details) {
      expect(typeof detalle.message).toBe("string");
      expect(detalle.message.length).toBeGreaterThan(0);
    }
  });
});
