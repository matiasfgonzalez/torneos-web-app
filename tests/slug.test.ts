import { describe, expect, it } from "vitest";
import { slugify } from "@/lib/slug";

describe("slugify", () => {
  it("pasa a minúsculas y separa con guiones", () => {
    expect(slugify("Copa de Verano")).toBe("copa-de-verano");
  });

  it("saca acentos y diacríticos", () => {
    expect(slugify("Fútbol Región Ñandú")).toBe("futbol-region-nandu");
  });

  it("colapsa símbolos y espacios repetidos", () => {
    expect(slugify("Apertura   2026 !!! (A)")).toBe("apertura-2026-a");
  });

  it("recorta guiones de los extremos", () => {
    expect(slugify("  -- Clausura -- ")).toBe("clausura");
  });

  it("cadena sin caracteres válidos → fallback", () => {
    expect(slugify("!!!")).toBe("item");
    expect(slugify("")).toBe("item");
  });

  it("limita la longitud a 60 caracteres", () => {
    expect(slugify("a".repeat(100)).length).toBe(60);
  });
});
