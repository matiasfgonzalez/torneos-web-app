import { describe, expect, it } from "vitest";
import {
  accumulationYellows,
  computeDesiredSuspensions,
  computeServed,
  CardInput,
} from "@/lib/suspensions/rules";

// Helper para armar tarjetas. day = día del mes (define orden cronológico).
let seq = 0;
const card = (
  type: "AMARILLA" | "ROJA",
  day: number,
  matchId = `m${day}`,
): CardInput => ({
  id: `c${seq++}`,
  matchId,
  type,
  matchDate: new Date(2026, 0, day),
  createdAt: new Date(2026, 0, day, 0, 0, seq),
});

const config = { yellowsForSuspension: 5, matchesPerRedCard: 1 };

describe("accumulationYellows", () => {
  it("excluye amarillas de un partido con roja (evita triple castigo)", () => {
    const cards = [
      card("AMARILLA", 1, "m1"),
      card("AMARILLA", 2, "m2"),
      card("AMARILLA", 2, "m2"), // doble amarilla...
      card("ROJA", 2, "m2"), // ...que generó la roja en m2
    ];
    const acc = accumulationYellows(cards);
    // Solo la amarilla de m1 cuenta para acumulación
    expect(acc).toHaveLength(1);
    expect(acc[0].matchId).toBe("m1");
  });

  it("ordena cronológicamente por fecha de partido", () => {
    const cards = [card("AMARILLA", 3), card("AMARILLA", 1), card("AMARILLA", 2)];
    const acc = accumulationYellows(cards);
    expect(acc.map((c) => c.matchDate.getDate())).toEqual([1, 2, 3]);
  });
});

describe("computeDesiredSuspensions", () => {
  it("una suspensión por cada roja", () => {
    const cards = [card("ROJA", 1), card("ROJA", 3)];
    const desired = computeDesiredSuspensions(cards, config);
    expect(desired.filter((d) => d.reason === "ROJA")).toHaveLength(2);
    expect(desired.every((d) => d.totalMatches === 1)).toBe(true);
  });

  it("roja con matchesPerRedCard=2 dura 2 fechas", () => {
    const desired = computeDesiredSuspensions([card("ROJA", 1)], {
      yellowsForSuspension: 5,
      matchesPerRedCard: 2,
    });
    expect(desired[0].totalMatches).toBe(2);
  });

  it("acumulación: 5 amarillas → 1 suspensión (índice 1)", () => {
    const cards = [1, 2, 3, 4, 5].map((d) => card("AMARILLA", d));
    const desired = computeDesiredSuspensions(cards, config);
    const acc = desired.filter((d) => d.reason === "ACUMULACION");
    expect(acc).toHaveLength(1);
    expect(acc[0].accumulationIndex).toBe(1);
    // se dispara con la 5ta amarilla (día 5)
    expect(acc[0].triggerDate.getDate()).toBe(5);
  });

  it("acumulación: 10 amarillas → 2 suspensiones (índices 1 y 2)", () => {
    const cards = Array.from({ length: 10 }, (_, i) => card("AMARILLA", i + 1));
    const desired = computeDesiredSuspensions(cards, config);
    const acc = desired.filter((d) => d.reason === "ACUMULACION");
    expect(acc.map((d) => d.accumulationIndex)).toEqual([1, 2]);
  });

  it("4 amarillas todavía no gatillan acumulación", () => {
    const cards = [1, 2, 3, 4].map((d) => card("AMARILLA", d));
    const desired = computeDesiredSuspensions(cards, config);
    expect(desired.filter((d) => d.reason === "ACUMULACION")).toHaveLength(0);
  });

  it("config 0 desactiva el mecanismo correspondiente", () => {
    const cards = [
      ...[1, 2, 3, 4, 5].map((d) => card("AMARILLA", d)),
      card("ROJA", 6),
    ];
    const noYellows = computeDesiredSuspensions(cards, {
      yellowsForSuspension: 0,
      matchesPerRedCard: 1,
    });
    expect(noYellows.every((d) => d.reason === "ROJA")).toBe(true);

    const noReds = computeDesiredSuspensions(cards, {
      yellowsForSuspension: 5,
      matchesPerRedCard: 0,
    });
    expect(noReds.every((d) => d.reason === "ACUMULACION")).toBe(true);
  });

  it("es idempotente: mismas tarjetas → mismas claves", () => {
    const cards = [1, 2, 3, 4, 5].map((d) => card("AMARILLA", d));
    const a = computeDesiredSuspensions(cards, config);
    const b = computeDesiredSuspensions(cards, config);
    expect(a).toEqual(b);
  });
});

describe("computeServed", () => {
  const trigger = new Date(2026, 0, 10);

  it("cuenta partidos posteriores hasta el tope", () => {
    const dates = [
      new Date(2026, 0, 5), // antes: no cuenta
      new Date(2026, 0, 12), // después: cuenta
    ];
    const res = computeServed(trigger, dates, 1);
    expect(res.servedMatches).toBe(1);
    expect(res.isActive).toBe(false);
  });

  it("sigue activa si no se cumplieron todas las fechas", () => {
    const dates = [new Date(2026, 0, 12)];
    const res = computeServed(trigger, dates, 2);
    expect(res.servedMatches).toBe(1);
    expect(res.isActive).toBe(true);
  });

  it("sin partidos posteriores: 0 cumplidas, activa", () => {
    const res = computeServed(trigger, [new Date(2026, 0, 1)], 1);
    expect(res).toEqual({ servedMatches: 0, isActive: true });
  });

  it("no supera el total aunque haya muchos partidos", () => {
    const dates = [12, 13, 14, 15].map((d) => new Date(2026, 0, d));
    const res = computeServed(trigger, dates, 2);
    expect(res.servedMatches).toBe(2);
    expect(res.isActive).toBe(false);
  });
});
