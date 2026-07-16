import { describe, expect, it } from "vitest";
import { nationalIdSchema, playerCreateSchema } from "@/lib/validators/player";

/**
 * El DNI es la clave de identidad global del jugador (N12): si la
 * normalización falla, el índice único no sirve y la misma persona entra dos
 * veces. Estos tests fijan esa regla.
 */
describe("nationalIdSchema — normalización", () => {
  it("saca los puntos: '12.345.678' y '12345678' son el mismo documento", () => {
    expect(nationalIdSchema.parse("12.345.678")).toBe("12345678");
    expect(nationalIdSchema.parse("12345678")).toBe("12345678");
  });

  it("saca espacios y guiones", () => {
    expect(nationalIdSchema.parse(" 12 345 678 ")).toBe("12345678");
    expect(nationalIdSchema.parse("12-345-678")).toBe("12345678");
  });

  it("las variantes del mismo DNI normalizan al mismo valor", () => {
    const formas = ["12.345.678", "12345678", "12 345 678", " 12-345-678 "];
    const normalizados = new Set(formas.map((f) => nationalIdSchema.parse(f)));
    expect(normalizados.size).toBe(1);
  });

  it("acepta documentos con letras (pasaporte, extranjeros)", () => {
    expect(nationalIdSchema.parse("AB123456")).toBe("AB123456");
  });
});

describe("nationalIdSchema — rechazos", () => {
  it("rechaza uno demasiado corto", () => {
    expect(nationalIdSchema.safeParse("123").success).toBe(false);
  });

  it("rechaza vacío", () => {
    expect(nationalIdSchema.safeParse("").success).toBe(false);
    expect(nationalIdSchema.safeParse("   ").success).toBe(false);
  });

  it("rechaza símbolos que no son de un documento", () => {
    expect(nationalIdSchema.safeParse("12345678'; DROP--").success).toBe(false);
    expect(nationalIdSchema.safeParse("1234/5678").success).toBe(false);
  });
});

describe("playerCreateSchema", () => {
  it("exige DNI: sin él no hay identidad ni dedupe posible", () => {
    const result = playerCreateSchema.safeParse({ name: "Juan Pérez" });
    expect(result.success).toBe(false);
  });

  it("exige nombre", () => {
    expect(
      playerCreateSchema.safeParse({ nationalId: "12345678" }).success,
    ).toBe(false);
  });

  it("acepta nombre + DNI y normaliza el documento", () => {
    const result = playerCreateSchema.safeParse({
      name: "Juan Pérez",
      nationalId: "12.345.678",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.nationalId).toBe("12345678");
  });

  it("el resto de los datos sigue siendo opcional", () => {
    const result = playerCreateSchema.safeParse({
      name: "Juan Pérez",
      nationalId: "12345678",
      birthDate: "",
      position: "",
    });
    expect(result.success).toBe(true);
  });
});
