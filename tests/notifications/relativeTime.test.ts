import { describe, expect, it } from "vitest";

import { relativeTime } from "@modules/notificaciones/lib/relativeTime";

/** Fecha fija: `now` se inyecta, así el test no depende del reloj. */
const NOW = new Date("2026-07-17T12:00:00Z");
const agoMs = (ms: number) => new Date(NOW.getTime() - ms);

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

describe("relativeTime", () => {
  it("menos de un minuto es 'recién'", () => {
    expect(relativeTime(agoMs(30_000), NOW)).toBe("recién");
  });

  it("minutos", () => {
    expect(relativeTime(agoMs(5 * MINUTE), NOW)).toBe("hace 5 min");
    expect(relativeTime(agoMs(59 * MINUTE), NOW)).toBe("hace 59 min");
  });

  it("horas, en singular y plural", () => {
    expect(relativeTime(agoMs(HOUR), NOW)).toBe("hace 1 hora");
    expect(relativeTime(agoMs(5 * HOUR), NOW)).toBe("hace 5 horas");
  });

  it("un día es 'ayer'", () => {
    expect(relativeTime(agoMs(DAY), NOW)).toBe("ayer");
  });

  it("hasta una semana, en días", () => {
    expect(relativeTime(agoMs(3 * DAY), NOW)).toBe("hace 3 días");
  });

  it("más de una semana pasa a fecha concreta", () => {
    // "hace 23 días" no le dice nada a nadie; la fecha sí.
    const result = relativeTime(agoMs(23 * DAY), NOW);
    expect(result).not.toContain("hace");
    expect(result).toContain("jun");
  });

  it("otro año incluye el año", () => {
    expect(relativeTime(new Date("2025-03-12T12:00:00Z"), NOW)).toContain("2025");
  });

  it("una fecha futura no dice 'hace -5 min'", () => {
    // El reloj del cliente puede estar atrasado respecto del server.
    expect(relativeTime(new Date(NOW.getTime() + 5 * MINUTE), NOW)).toBe("recién");
  });

  it("acepta el string ISO que manda el server", () => {
    expect(relativeTime(agoMs(2 * HOUR).toISOString(), NOW)).toBe("hace 2 horas");
  });
});
