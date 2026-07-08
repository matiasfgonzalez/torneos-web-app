import { describe, expect, it } from "vitest";
import {
  DEFAULT_TIEBREAKERS,
  makeStandingsComparator,
  normalizeTiebreakers,
  StandingRow,
} from "@/lib/standings/config";

// Helper para armar filas de tabla con defaults
const row = (r: Partial<StandingRow>): StandingRow => ({
  points: 0,
  goalDifference: 0,
  goalsFor: 0,
  goalsAgainst: 0,
  wins: 0,
  ...r,
});

describe("normalizeTiebreakers", () => {
  it("null/basura → orden por defecto", () => {
    expect(normalizeTiebreakers(null)).toEqual(DEFAULT_TIEBREAKERS);
    expect(normalizeTiebreakers("nope")).toEqual(DEFAULT_TIEBREAKERS);
    expect(normalizeTiebreakers([])).toEqual(DEFAULT_TIEBREAKERS);
  });

  it("filtra criterios inválidos y deduplica", () => {
    expect(normalizeTiebreakers(["PTS", "XX", "DIF", "DIF"])).toEqual([
      "PTS",
      "DIF",
    ]);
  });

  it("siempre pone PTS primero", () => {
    expect(normalizeTiebreakers(["DIF", "GF", "PTS"])).toEqual([
      "PTS",
      "DIF",
      "GF",
    ]);
  });

  it("si no viene PTS, lo antepone", () => {
    expect(normalizeTiebreakers(["GF", "WINS"])).toEqual(["PTS", "GF", "WINS"]);
  });
});

describe("makeStandingsComparator", () => {
  it("ordena por puntos descendente", () => {
    const teams = [row({ points: 3 }), row({ points: 9 }), row({ points: 6 })];
    const sorted = [...teams].sort(makeStandingsComparator());
    expect(sorted.map((t) => t.points)).toEqual([9, 6, 3]);
  });

  it("desempata por diferencia de gol con el orden por defecto", () => {
    const a = row({ points: 6, goalDifference: 2, goalsFor: 10 });
    const b = row({ points: 6, goalDifference: 5, goalsFor: 7 });
    const sorted = [a, b].sort(makeStandingsComparator());
    expect(sorted[0]).toBe(b); // mayor DIF primero
  });

  it("respeta un orden custom (GF antes que DIF)", () => {
    const a = row({ points: 6, goalDifference: 5, goalsFor: 7 });
    const b = row({ points: 6, goalDifference: 2, goalsFor: 10 });
    // Preset GF_FIRST
    const sorted = [a, b].sort(
      makeStandingsComparator(["PTS", "GF", "DIF", "WINS"]),
    );
    expect(sorted[0]).toBe(b); // más GF primero, aunque tenga menos DIF
  });

  it("GA: menos goles en contra rankea mejor", () => {
    const a = row({ points: 6, goalDifference: 0, goalsFor: 5, goalsAgainst: 5 });
    const b = row({ points: 6, goalDifference: 0, goalsFor: 3, goalsAgainst: 3 });
    const sorted = [a, b].sort(
      makeStandingsComparator(["PTS", "GA"]),
    );
    expect(sorted[0]).toBe(b); // menos GA primero
  });
});
