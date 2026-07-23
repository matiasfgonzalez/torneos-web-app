import { describe, expect, it } from "vitest";
import {
  canCreateMatchInTournament,
  canEditMatchInTournament,
  isTournamentReadOnlyForMatches,
  validateMatchRules,
  type MatchRuleInput,
} from "@/lib/match-rules";

const baseMatch: MatchRuleInput = {
  homeTeamId: "a",
  awayTeamId: "b",
  status: "PROGRAMADO",
  homeScore: null,
  awayScore: null,
  isWalkover: false,
};

describe("validateMatchRules", () => {
  it("rechaza un equipo jugando contra sí mismo", () => {
    const r = validateMatchRules({ ...baseMatch, awayTeamId: "a" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/sí mismo/i);
  });

  it("un partido programado sin marcador es válido", () => {
    expect(validateMatchRules(baseMatch)).toEqual({ ok: true });
  });

  it("finalizado sin marcador se rechaza", () => {
    const r = validateMatchRules({ ...baseMatch, status: "FINALIZADO" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/marcador/i);
  });

  it("finalizado con marcador completo es válido", () => {
    expect(
      validateMatchRules({
        ...baseMatch,
        status: "FINALIZADO",
        homeScore: 2,
        awayScore: 1,
      }),
    ).toEqual({ ok: true });
  });

  it("finalizado por walkover no exige marcador (lo pone el server)", () => {
    expect(
      validateMatchRules({
        ...baseMatch,
        status: "FINALIZADO",
        isWalkover: true,
      }),
    ).toEqual({ ok: true });
  });

  it("marcador negativo se rechaza", () => {
    const r = validateMatchRules({ ...baseMatch, homeScore: -1, awayScore: 0 });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/negativo/i);
  });
});

describe("estado del torneo y sus partidos", () => {
  it("archivado y cancelado son de solo lectura", () => {
    expect(isTournamentReadOnlyForMatches("ARCHIVADO")).toBe(true);
    expect(isTournamentReadOnlyForMatches("CANCELADO")).toBe(true);
  });

  it("activo y finalizado NO son de solo lectura (finalizado permite corregir)", () => {
    expect(isTournamentReadOnlyForMatches("ACTIVO")).toBe(false);
    expect(isTournamentReadOnlyForMatches("FINALIZADO")).toBe(false);
  });

  it("no se crean partidos en un torneo finalizado, archivado ni cancelado", () => {
    expect(canCreateMatchInTournament("FINALIZADO").ok).toBe(false);
    expect(canCreateMatchInTournament("ARCHIVADO").ok).toBe(false);
    expect(canCreateMatchInTournament("CANCELADO").ok).toBe(false);
    expect(canCreateMatchInTournament("ACTIVO")).toEqual({ ok: true });
  });

  it("sí se editan resultados en finalizado; no en archivado/cancelado", () => {
    expect(canEditMatchInTournament("FINALIZADO")).toEqual({ ok: true });
    expect(canEditMatchInTournament("ARCHIVADO").ok).toBe(false);
    expect(canEditMatchInTournament("CANCELADO").ok).toBe(false);
  });
});
