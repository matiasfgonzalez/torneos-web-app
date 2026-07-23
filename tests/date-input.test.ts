import { describe, expect, it } from "vitest";
import { toDateOnlyInput, toDateInput } from "@/lib/date-input";

/**
 * Regresión del bug de /mi-ficha: la fecha de nacimiento perdía un día en cada
 * guardado. Causa: se guarda como medianoche UTC (`new Date("1995-03-05")` →
 * `...T00:00:00Z`) pero el form la leía en hora local, y al oeste de Greenwich
 * eso da el día anterior. `toDateOnlyInput` la lee en UTC → estable.
 */
describe("toDateOnlyInput (campos date-only)", () => {
  it("lee la fecha civil en UTC, sin correrse por zona horaria", () => {
    expect(toDateOnlyInput("1995-03-05T00:00:00.000Z")).toBe("1995-03-05");
    expect(toDateOnlyInput(new Date(Date.UTC(1995, 2, 5)))).toBe("1995-03-05");
  });

  it("es idempotente: guardar lo que muestra no corre el día", () => {
    // El validador parsea "1995-03-05" como medianoche UTC (z.coerce.date).
    const guardado = new Date("1995-03-05");
    const mostrado = toDateOnlyInput(guardado); // lo que va al input
    expect(mostrado).toBe("1995-03-05");
    // Volver a guardar ese valor y re-leerlo da lo mismo (no pierde días).
    expect(toDateOnlyInput(new Date(mostrado))).toBe("1995-03-05");
  });

  it("vacío/nulo → cadena vacía", () => {
    expect(toDateOnlyInput(null)).toBe("");
    expect(toDateOnlyInput(undefined)).toBe("");
    expect(toDateOnlyInput("")).toBe("");
  });

  it("no confundir con toDateInput, que es para fecha+hora local", () => {
    // toDateInput usa getters locales (correcto para un partido a las 21:00);
    // para date-only hay que usar toDateOnlyInput.
    expect(typeof toDateInput).toBe("function");
  });
});
