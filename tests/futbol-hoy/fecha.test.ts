import { describe, expect, it } from "vitest";

import {
  correrDia,
  diaArgentino,
  esDiaValido,
  hoyArgentino,
} from "@/lib/futbol-hoy/fecha";

describe("diaArgentino", () => {
  it("un partido de la noche argentina NO se corre al día siguiente", () => {
    // 22:00 del 2 de agosto en Buenos Aires = 01:00 UTC del 3.
    // Agrupar por UTC lo mandaría a "mañana" y el hincha no lo encontraría.
    expect(diaArgentino(new Date("2026-08-03T01:00:00Z"))).toBe("2026-08-02");
  });

  it("la medianoche argentina abre el día nuevo", () => {
    expect(diaArgentino(new Date("2026-08-03T03:00:00Z"))).toBe("2026-08-03");
    expect(diaArgentino(new Date("2026-08-03T02:59:59Z"))).toBe("2026-08-02");
  });

  it("un mediodía UTC cae en el mismo día", () => {
    expect(diaArgentino(new Date("2026-08-02T12:00:00Z"))).toBe("2026-08-02");
  });

  it("cruza fin de mes y fin de año sin romperse", () => {
    expect(diaArgentino(new Date("2026-09-01T02:00:00Z"))).toBe("2026-08-31");
    expect(diaArgentino(new Date("2027-01-01T02:00:00Z"))).toBe("2026-12-31");
  });

  it("rellena mes y día con cero a la izquierda", () => {
    expect(diaArgentino(new Date("2026-03-05T15:00:00Z"))).toBe("2026-03-05");
  });

  it("hoyArgentino usa el instante que se le pasa", () => {
    expect(hoyArgentino(new Date("2026-08-03T01:00:00Z"))).toBe("2026-08-02");
  });
});

describe("esDiaValido", () => {
  it("acepta AAAA-MM-DD real", () => {
    expect(esDiaValido("2026-08-02")).toBe(true);
    expect(esDiaValido("2024-02-29")).toBe(true); // año bisiesto
  });

  it("rechaza formatos que no son AAAA-MM-DD", () => {
    expect(esDiaValido("02/08/2026")).toBe(false);
    expect(esDiaValido("2026-8-2")).toBe(false);
    expect(esDiaValido("hoy")).toBe(false);
    expect(esDiaValido("")).toBe(false);
    expect(esDiaValido("2026-08-02T10:00:00Z")).toBe(false);
  });

  it("rechaza fechas con forma correcta que no existen", () => {
    // El regex solo las dejaría pasar; la API respondería una lista vacía y la
    // página diría "no hay partidos" en vez de "esa fecha no existe".
    expect(esDiaValido("2026-02-31")).toBe(false);
    expect(esDiaValido("2026-13-01")).toBe(false);
    expect(esDiaValido("2025-02-29")).toBe(false); // 2025 no es bisiesto
  });
});

describe("correrDia", () => {
  it("suma y resta días", () => {
    expect(correrDia("2026-08-02", 1)).toBe("2026-08-03");
    expect(correrDia("2026-08-02", -1)).toBe("2026-08-01");
    expect(correrDia("2026-08-02", 0)).toBe("2026-08-02");
  });

  it("cruza meses, años y el 29 de febrero", () => {
    expect(correrDia("2026-08-31", 1)).toBe("2026-09-01");
    expect(correrDia("2026-01-01", -1)).toBe("2025-12-31");
    expect(correrDia("2024-02-28", 1)).toBe("2024-02-29");
    expect(correrDia("2025-02-28", 1)).toBe("2025-03-01");
  });
});
