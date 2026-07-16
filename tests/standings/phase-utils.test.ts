import { describe, expect, it } from "vitest";
import {
  getTournamentDisplayType,
  isFinalPhase,
  isKnockoutPhaseType,
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

// Los helpers legacy (`legacyPhaseCountsPoints`, `isKnockoutPhase`,
// `getLegacyPhaseName`, `getKnockoutPhaseOrder`) se borraron en S1: hablaban del
// modelo `Phase` eliminado en A6 y comparaban nombres que ninguna query trae.
describe("isKnockoutPhaseType", () => {
  it("detecta la fase de eliminación por su tipo", () => {
    expect(isKnockoutPhaseType("KNOCKOUT")).toBe(true);
    expect(isKnockoutPhaseType("knockout")).toBe(true);
  });

  it("grupos y liga no son eliminación", () => {
    expect(isKnockoutPhaseType("GROUP")).toBe(false);
    expect(isKnockoutPhaseType("LEAGUE")).toBe(false);
  });

  it("sin fase no es eliminación", () => {
    expect(isKnockoutPhaseType(null)).toBe(false);
    expect(isKnockoutPhaseType(undefined)).toBe(false);
  });
});

describe("isFinalPhase", () => {
  it("reconoce la final por nombre, sin confundirla con la semifinal", () => {
    expect(isFinalPhase("Final")).toBe(true);
    expect(isFinalPhase("final")).toBe(true);
    expect(isFinalPhase("Semifinal")).toBe(false);
    expect(isFinalPhase("Cuartos de final")).toBe(false);
    expect(isFinalPhase(null)).toBe(false);
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
