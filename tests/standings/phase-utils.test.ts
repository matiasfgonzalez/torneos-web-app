import { describe, expect, it } from "vitest";
import {
  getTournamentDisplayType,
  isKnockoutPhase,
  legacyPhaseCountsPoints,
  phaseTypeCountsPoints,
} from "@/lib/standings/phase-utils";

describe("phaseTypeCountsPoints", () => {
  it("GROUP y LEAGUE suman puntos", () => {
    expect(phaseTypeCountsPoints("GROUP")).toBe(true);
    expect(phaseTypeCountsPoints("LEAGUE")).toBe(true);
  });

  it("KNOCKOUT no suma puntos", () => {
    expect(phaseTypeCountsPoints("KNOCKOUT")).toBe(false);
  });

  it("es case-insensitive", () => {
    expect(phaseTypeCountsPoints("knockout")).toBe(false);
    expect(phaseTypeCountsPoints("group")).toBe(true);
  });

  it("sin tipo definido suma puntos (default)", () => {
    expect(phaseTypeCountsPoints(null)).toBe(true);
    expect(phaseTypeCountsPoints(undefined)).toBe(true);
    expect(phaseTypeCountsPoints("")).toBe(true);
  });
});

describe("legacyPhaseCountsPoints", () => {
  it("FECHA y FASES_DE_GRUPOS suman", () => {
    expect(legacyPhaseCountsPoints("FECHA")).toBe(true);
    expect(legacyPhaseCountsPoints("FASES_DE_GRUPOS")).toBe(true);
  });

  it("fases eliminatorias no suman", () => {
    expect(legacyPhaseCountsPoints("FINAL")).toBe(false);
    expect(legacyPhaseCountsPoints("SEMIFINAL")).toBe(false);
    expect(legacyPhaseCountsPoints("CRUCES")).toBe(false);
  });

  it("sin fase suma (default)", () => {
    expect(legacyPhaseCountsPoints(null)).toBe(true);
  });
});

describe("isKnockoutPhase", () => {
  it("detecta fases knockout", () => {
    expect(isKnockoutPhase("OCTAVOS_DE_FINAL")).toBe(true);
    expect(isKnockoutPhase("FECHA")).toBe(false);
    expect(isKnockoutPhase(null)).toBe(false);
  });
});

describe("getTournamentDisplayType", () => {
  it("mapea formatos a su visualización", () => {
    expect(getTournamentDisplayType("LIGA")).toBe("table");
    expect(getTournamentDisplayType("COPA")).toBe("bracket");
    expect(getTournamentDisplayType("MIXTO")).toBe("mixed");
    expect(getTournamentDisplayType("DESCONOCIDO")).toBe("table");
  });
});
