import { describe, expect, it } from "vitest";

import { computeTeamForm } from "@/lib/stats/form";
import { teamOutcome } from "@/lib/stats/match-outcome";
import type { StatMatch, StatTeamRef } from "@/lib/stats/types";

const team = (id: string, name: string): StatTeamRef => ({
  tournamentTeamId: id,
  teamId: `team-${id}`,
  teamName: name,
  teamLogoUrl: null,
});

/** Partido jugado (FINALIZADO con marcador) en una fecha dada. */
const played = (
  home: string,
  away: string,
  hs: number,
  as: number,
  date: string,
): StatMatch => ({
  homeTeamId: home,
  awayTeamId: away,
  homeScore: hs,
  awayScore: as,
  status: "FINALIZADO",
  dateTime: date,
});

describe("teamOutcome", () => {
  it("W/D/L según el marcador, desde la óptica del equipo", () => {
    const m = played("a", "b", 2, 1, "2026-01-01");
    expect(teamOutcome(m, "a")).toBe("W");
    expect(teamOutcome(m, "b")).toBe("L");
    expect(teamOutcome(played("a", "b", 1, 1, "2026-01-01"), "a")).toBe("D");
  });

  it("null si el partido no se jugó o el equipo no participó", () => {
    expect(teamOutcome(played("a", "b", 2, 1, "2026-01-01"), "c")).toBeNull();
    const programado: StatMatch = {
      homeTeamId: "a",
      awayTeamId: "b",
      homeScore: null,
      awayScore: null,
      status: "PROGRAMADO",
      dateTime: "2026-01-01",
    };
    expect(teamOutcome(programado, "a")).toBeNull();
  });

  it("el WALKOVER cuenta (trae marcador fijado por el server)", () => {
    const wo: StatMatch = {
      homeTeamId: "a",
      awayTeamId: "b",
      homeScore: 3,
      awayScore: 0,
      status: "WALKOVER",
      dateTime: "2026-01-01",
    };
    expect(teamOutcome(wo, "a")).toBe("W");
    expect(teamOutcome(wo, "b")).toBe("L");
  });
});

describe("computeTeamForm", () => {
  const teams = [team("a", "Alfa"), team("b", "Beta")];
  // Alfa: gana, pierde, gana, gana (en orden cronológico).
  const matches = [
    played("a", "b", 1, 0, "2026-01-01"), // A gana
    played("b", "a", 2, 0, "2026-01-08"), // A pierde
    played("a", "b", 3, 1, "2026-01-15"), // A gana
    played("a", "b", 2, 0, "2026-01-22"), // A gana
  ];

  it("ordena la forma del más viejo al más nuevo", () => {
    const [alfa] = computeTeamForm(teams, matches);
    expect(alfa.recent).toEqual(["W", "L", "W", "W"]);
  });

  it("la racha se mide desde el partido más reciente", () => {
    const [alfa, beta] = computeTeamForm(teams, matches);
    expect(alfa.streak).toEqual({ type: "W", count: 2 });
    // Beta es el espejo: perdió los últimos dos.
    expect(beta.streak).toEqual({ type: "L", count: 2 });
  });

  it("respeta el límite de partidos recientes", () => {
    const [alfa] = computeTeamForm(teams, matches, { recent: 2 });
    expect(alfa.recent).toEqual(["W", "W"]);
    expect(alfa.played).toBe(4); // played cuenta todos, no solo los recientes
  });

  it("un equipo sin partidos aparece con racha null", () => {
    const [, , gamma] = computeTeamForm(
      [...teams, team("g", "Gamma")],
      matches,
    );
    expect(gamma.recent).toEqual([]);
    expect(gamma.streak).toBeNull();
    expect(gamma.played).toBe(0);
  });

  it("no depende del orden de entrada de los partidos", () => {
    const shuffled = [matches[2], matches[0], matches[3], matches[1]];
    const [alfa] = computeTeamForm(teams, shuffled);
    expect(alfa.recent).toEqual(["W", "L", "W", "W"]);
    expect(alfa.streak).toEqual({ type: "W", count: 2 });
  });
});
