import { describe, expect, it } from "vitest";

import { computeFairPlay, FAIR_PLAY_POINTS } from "@/lib/stats/fair-play";
import type { StatCard, StatTeamRef } from "@/lib/stats/types";

const team = (id: string, name: string): StatTeamRef => ({
  tournamentTeamId: id,
  teamId: `team-${id}`,
  teamName: name,
  teamLogoUrl: null,
});

const yellow = (id: string): StatCard => ({
  tournamentTeamId: id,
  type: "AMARILLA",
});
const red = (id: string): StatCard => ({ tournamentTeamId: id, type: "ROJA" });

describe("computeFairPlay", () => {
  it("el equipo con menos puntos de tarjeta va primero", () => {
    const teams = [team("a", "Alfa"), team("b", "Beta")];
    const cards = [yellow("a"), yellow("a"), red("b")];
    // Alfa: 2 amarillas = 2 pts. Beta: 1 roja = 3 pts. Alfa es más limpio.
    const ranking = computeFairPlay(teams, cards);
    expect(ranking.map((r) => r.teamName)).toEqual(["Alfa", "Beta"]);
    expect(ranking[0].points).toBe(2);
    expect(ranking[1].points).toBe(3);
  });

  it("incluye a los equipos sin tarjetas como los más limpios", () => {
    const teams = [team("a", "Alfa"), team("b", "Beta")];
    // Solo Beta tiene tarjetas; Alfa (0) debe aparecer y liderar.
    const ranking = computeFairPlay(teams, [yellow("b")]);
    expect(ranking).toHaveLength(2);
    expect(ranking[0].teamName).toBe("Alfa");
    expect(ranking[0].points).toBe(0);
  });

  it("aplica la escala amarilla 1 / roja 3", () => {
    const ranking = computeFairPlay(
      [team("a", "Alfa")],
      [yellow("a"), red("a")],
    );
    expect(ranking[0].points).toBe(
      FAIR_PLAY_POINTS.yellow + FAIR_PLAY_POINTS.red,
    );
    expect(ranking[0].yellowCards).toBe(1);
    expect(ranking[0].redCards).toBe(1);
  });

  it("a igualdad de puntos, desempata por menos rojas", () => {
    // Alfa: 3 amarillas = 3 pts, 0 rojas. Beta: 1 roja = 3 pts, 1 roja.
    // Mismo puntaje; Alfa va primero por tener menos rojas.
    const ranking = computeFairPlay(
      [team("b", "Beta"), team("a", "Alfa")],
      [yellow("a"), yellow("a"), yellow("a"), red("b")],
    );
    expect(ranking[0].teamName).toBe("Alfa");
  });

  it("ignora tarjetas de equipos que no participan", () => {
    const ranking = computeFairPlay([team("a", "Alfa")], [red("fantasma")]);
    expect(ranking).toHaveLength(1);
    expect(ranking[0].points).toBe(0);
  });

  it("el orden no depende de cómo vinieron las filas (estable por nombre)", () => {
    const teams = [team("z", "Zeta"), team("a", "Alfa")];
    // Ambos sin tarjetas: mismo puntaje, desempate final por nombre.
    const ranking = computeFairPlay(teams, []);
    expect(ranking.map((r) => r.teamName)).toEqual(["Alfa", "Zeta"]);
  });
});
