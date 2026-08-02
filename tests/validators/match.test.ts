import { describe, expect, it } from "vitest";
import {
  matchCreateSchema,
  matchUpdateSchema,
} from "@/lib/validators/match";

/**
 * A8 — validadores de partido.
 *
 * Es el esquema que cierra C2 (mass assignment) y C3 (fechas sin validar) en la
 * ruta más caliente del sistema: un `dateTime` mal parseado guarda `Invalid Date`
 * y un marcador fuera de rango entra derecho al recálculo de la tabla.
 */

const base = {
  dateTime: "2025-08-10T20:00:00.000Z",
  tournamentId: "trn_1",
  homeTeamId: "eq_local",
  awayTeamId: "eq_visita",
};

describe("matchCreateSchema — campos obligatorios", () => {
  it("acepta el mínimo: fecha, torneo y los dos equipos", () => {
    const result = matchCreateSchema.safeParse(base);
    expect(result.success).toBe(true);
  });

  it.each(["tournamentId", "homeTeamId", "awayTeamId", "dateTime"])(
    "rechaza si falta %s",
    (campo) => {
      const payload: Record<string, unknown> = { ...base };
      delete payload[campo];
      expect(matchCreateSchema.safeParse(payload).success).toBe(false);
    },
  );

  it("rechaza ids vacíos (un string vacío no es una relación)", () => {
    expect(
      matchCreateSchema.safeParse({ ...base, homeTeamId: "" }).success,
    ).toBe(false);
  });
});

describe("matchCreateSchema — fecha (C3)", () => {
  it("coerciona el string ISO a Date", () => {
    const result = matchCreateSchema.parse(base);
    expect(result.dateTime).toBeInstanceOf(Date);
    expect(result.dateTime.toISOString()).toBe("2025-08-10T20:00:00.000Z");
  });

  it("rechaza una fecha inválida en vez de guardar Invalid Date", () => {
    expect(
      matchCreateSchema.safeParse({ ...base, dateTime: "10/08/2025 a las 8" })
        .success,
    ).toBe(false);
    expect(
      matchCreateSchema.safeParse({ ...base, dateTime: "" }).success,
    ).toBe(false);
  });
});

describe("matchCreateSchema — marcadores", () => {
  it("acepta los extremos del rango", () => {
    expect(
      matchCreateSchema.safeParse({ ...base, homeScore: 0, awayScore: 99 })
        .success,
    ).toBe(true);
  });

  it("rechaza goles negativos o absurdos", () => {
    expect(matchCreateSchema.safeParse({ ...base, homeScore: -1 }).success).toBe(
      false,
    );
    expect(
      matchCreateSchema.safeParse({ ...base, awayScore: 100 }).success,
    ).toBe(false);
  });

  it("rechaza goles fraccionarios", () => {
    expect(
      matchCreateSchema.safeParse({ ...base, homeScore: 1.5 }).success,
    ).toBe(false);
  });

  it('un marcador vacío ("" del formulario) queda en null, no en 0', () => {
    // La diferencia importa: `0` es un partido jugado 0-0 y `null` es un partido
    // sin cargar. El recálculo de la tabla los trata distinto.
    const result = matchCreateSchema.parse({ ...base, homeScore: "" });
    expect(result.homeScore).toBeNull();
  });

  it("coerciona el marcador que llega como texto", () => {
    const result = matchCreateSchema.parse({ ...base, homeScore: "2" });
    expect(result.homeScore).toBe(2);
  });
});

describe("matchCreateSchema — penales y walkover (N7)", () => {
  it("acepta el ganador por penales con su marcador", () => {
    const result = matchCreateSchema.safeParse({
      ...base,
      status: "FINALIZADO",
      penaltyWinnerTeamId: "eq_local",
      penaltyScoreHome: 4,
      penaltyScoreAway: 2,
    });
    expect(result.success).toBe(true);
  });

  it("acepta el ganador por walkover (el server fija el marcador)", () => {
    const result = matchCreateSchema.safeParse({
      ...base,
      status: "WALKOVER",
      walkoverWinnerTeamId: "eq_visita",
    });
    expect(result.success).toBe(true);
  });
});

describe("matchCreateSchema — estado y ronda", () => {
  it("acepta un MatchStatus válido", () => {
    expect(
      matchCreateSchema.safeParse({ ...base, status: "EN_JUEGO" }).success,
    ).toBe(true);
  });

  it("rechaza un estado inventado", () => {
    expect(
      matchCreateSchema.safeParse({ ...base, status: "JUGANDOSE" }).success,
    ).toBe(false);
  });

  it("la ronda arranca en 1 (no hay fecha 0)", () => {
    expect(
      matchCreateSchema.safeParse({ ...base, roundNumber: 0 }).success,
    ).toBe(false);
    expect(
      matchCreateSchema.safeParse({ ...base, roundNumber: 1 }).success,
    ).toBe(true);
  });
});

describe("matchCreateSchema — mass assignment (C2)", () => {
  it("descarta los campos que no declara el esquema", () => {
    const result = matchCreateSchema.parse({
      ...base,
      createdAt: "1999-01-01",
      refereeId: "arb_1",
      id: "id_falsificado",
    });
    expect(result).not.toHaveProperty("createdAt");
    expect(result).not.toHaveProperty("refereeId");
    expect(result).not.toHaveProperty("id");
  });

  it("recorta el estadio al máximo permitido", () => {
    expect(
      matchCreateSchema.safeParse({ ...base, stadium: "x".repeat(121) })
        .success,
    ).toBe(false);
  });
});

describe("matchUpdateSchema", () => {
  it("acepta una edición parcial: solo el marcador", () => {
    const result = matchUpdateSchema.safeParse({ homeScore: 2, awayScore: 2 });
    expect(result.success).toBe(true);
  });

  it("un objeto vacío es válido (no toca nada)", () => {
    expect(matchUpdateSchema.safeParse({}).success).toBe(true);
  });

  it("sigue validando lo que sí viene", () => {
    expect(matchUpdateSchema.safeParse({ homeScore: 500 }).success).toBe(false);
    expect(matchUpdateSchema.safeParse({ dateTime: "ayer" }).success).toBe(
      false,
    );
  });
});
