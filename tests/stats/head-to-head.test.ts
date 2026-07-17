import { describe, expect, it } from "vitest";

import { computeHeadToHead } from "@/lib/stats/head-to-head";
import type { StatMatch } from "@/lib/stats/types";

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

describe("computeHeadToHead", () => {
  it("agrega todo desde la óptica de A sin importar la localía", () => {
    const matches = [
      played("a", "b", 2, 1, "2026-01-01"), // A gana de local
      played("b", "a", 0, 0, "2026-02-01"), // empate, A de visitante
      played("b", "a", 3, 1, "2026-03-01"), // B gana (A pierde de visitante)
    ];
    const h2h = computeHeadToHead("a", "b", matches);

    expect(h2h.played).toBe(3);
    expect(h2h.aWins).toBe(1);
    expect(h2h.draws).toBe(1);
    expect(h2h.bWins).toBe(1);
    // Goles de A: 2 (local) + 0 (visitante) + 1 (visitante) = 3.
    // Goles de B: 1 + 0 + 3 = 4.
    expect(h2h.aGoals).toBe(3);
    expect(h2h.bGoals).toBe(4);
  });

  it("es el espejo exacto al invertir A y B", () => {
    const matches = [played("a", "b", 2, 1, "2026-01-01")];
    const ab = computeHeadToHead("a", "b", matches);
    const ba = computeHeadToHead("b", "a", matches);
    expect(ba.aWins).toBe(ab.bWins);
    expect(ba.bWins).toBe(ab.aWins);
    expect(ba.aGoals).toBe(ab.bGoals);
  });

  it("solo cuenta partidos entre esos dos equipos", () => {
    const matches = [
      played("a", "b", 1, 0, "2026-01-01"),
      played("a", "c", 5, 0, "2026-01-08"), // contra otro: se ignora
      played("c", "b", 2, 2, "2026-01-15"), // sin A: se ignora
    ];
    const h2h = computeHeadToHead("a", "b", matches);
    expect(h2h.played).toBe(1);
    expect(h2h.aGoals).toBe(1);
  });

  it("ignora los partidos no jugados", () => {
    const matches: StatMatch[] = [
      played("a", "b", 1, 0, "2026-01-01"),
      {
        homeTeamId: "a",
        awayTeamId: "b",
        homeScore: null,
        awayScore: null,
        status: "PROGRAMADO",
        dateTime: "2026-02-01",
      },
    ];
    expect(computeHeadToHead("a", "b", matches).played).toBe(1);
  });

  it("lista los partidos del más reciente al más viejo", () => {
    const matches = [
      played("a", "b", 1, 0, "2026-01-01"),
      played("a", "b", 2, 2, "2026-03-01"),
      played("a", "b", 0, 1, "2026-02-01"),
    ];
    const h2h = computeHeadToHead("a", "b", matches);
    expect(h2h.matches.map((m) => m.dateTime.slice(0, 10))).toEqual([
      "2026-03-01",
      "2026-02-01",
      "2026-01-01",
    ]);
    // El más reciente fue empate 2-2 → result "D" para A.
    expect(h2h.matches[0].result).toBe("D");
  });

  it("sin enfrentamientos devuelve todo en cero", () => {
    const h2h = computeHeadToHead("a", "b", []);
    expect(h2h).toMatchObject({ played: 0, aWins: 0, draws: 0, bWins: 0 });
    expect(h2h.matches).toEqual([]);
  });
});
