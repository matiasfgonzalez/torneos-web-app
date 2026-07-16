import { describe, expect, it } from "vitest";
import {
  bracketSize,
  knockoutFirstRound,
  knockoutRoundName,
  seedOrder,
} from "@/lib/fixture/knockout";

const teams = (n: number) => Array.from({ length: n }, (_, i) => `t${i + 1}`);

describe("bracketSize", () => {
  it("redondea a la potencia de 2 siguiente", () => {
    expect(bracketSize(2)).toBe(2);
    expect(bracketSize(5)).toBe(8);
    expect(bracketSize(8)).toBe(8);
    expect(bracketSize(9)).toBe(16);
    expect(bracketSize(12)).toBe(16);
  });
});

describe("seedOrder", () => {
  it("arma el cuadro estándar de 8", () => {
    expect(seedOrder(8)).toEqual([1, 8, 4, 5, 2, 7, 3, 6]);
  });

  it("el 1 y el 2 caen en mitades opuestas (solo se cruzan en la final)", () => {
    const order = seedOrder(16);
    const half = order.length / 2;
    expect(order.slice(0, half)).toContain(1);
    expect(order.slice(half)).toContain(2);
  });

  it("el 1 y el 4 no se cruzan antes de semis", () => {
    const order = seedOrder(8);
    const quarter = order.length / 4;
    // El 1 y el 4 comparten mitad pero no cuarto
    expect(order.slice(0, quarter)).toContain(1);
    expect(order.slice(quarter, quarter * 2)).toContain(4);
  });
});

describe("knockoutRoundName", () => {
  it("nombra las rondas conocidas", () => {
    expect(knockoutRoundName(2)).toBe("Final");
    expect(knockoutRoundName(4)).toBe("Semifinal");
    expect(knockoutRoundName(8)).toBe("Cuartos de final");
    expect(knockoutRoundName(16)).toBe("Octavos de final");
  });

  it("cae a un nombre genérico fuera de la tabla", () => {
    expect(knockoutRoundName(64)).toBe("Ronda de 64");
  });
});

describe("knockoutFirstRound — cuadro exacto", () => {
  it("8 equipos: 4 partidos, sin byes", () => {
    const { matches, byes, roundName } = knockoutFirstRound(teams(8));
    expect(matches).toHaveLength(4);
    expect(byes).toEqual([]);
    expect(roundName).toBe("Cuartos de final");
  });

  it("cruza al mejor sembrado contra el peor", () => {
    const { matches } = knockoutFirstRound(teams(8));
    expect(matches[0]).toMatchObject({ homeTeamId: "t1", awayTeamId: "t8" });
  });

  it("cada equipo juega exactamente un partido", () => {
    const { matches } = knockoutFirstRound(teams(8));
    const playing = matches.flatMap((m) => [m.homeTeamId, m.awayTeamId]);
    expect(new Set(playing).size).toBe(8);
  });

  it("2 equipos: una final", () => {
    const { matches, roundName } = knockoutFirstRound(teams(2));
    expect(matches).toHaveLength(1);
    expect(roundName).toBe("Final");
  });
});

describe("knockoutFirstRound — con byes", () => {
  it("6 equipos en cuadro de 8: 2 partidos y 2 byes", () => {
    const { matches, byes } = knockoutFirstRound(teams(6));
    expect(matches).toHaveLength(2);
    expect(byes).toHaveLength(2);
  });

  it("el bye lo reciben los mejores sembrados, no un sorteo", () => {
    const { byes } = knockoutFirstRound(teams(6));
    expect(byes).toEqual(["t1", "t2"]);
  });

  it("ningún equipo aparece a la vez con bye y jugando", () => {
    const { matches, byes } = knockoutFirstRound(teams(6));
    const playing = matches.flatMap((m) => [m.homeTeamId, m.awayTeamId]);
    byes.forEach((bye) => expect(playing).not.toContain(bye));
  });

  it("todos los equipos aparecen una sola vez (jugando o con bye)", () => {
    const { matches, byes } = knockoutFirstRound(teams(11));
    const all = [...matches.flatMap((m) => [m.homeTeamId, m.awayTeamId]), ...byes];
    expect(new Set(all).size).toBe(11);
    expect(all).toHaveLength(11);
  });

  it("5 equipos: solo el 1 zafa de la primera ronda", () => {
    const { matches, byes } = knockoutFirstRound(teams(5));
    // Cuadro de 8, 3 huecos → 3 byes (t1, t2, t3 por siembra)
    expect(byes).toEqual(["t1", "t2", "t3"]);
    expect(matches).toHaveLength(1);
    expect(matches[0]).toMatchObject({ homeTeamId: "t4", awayTeamId: "t5" });
  });
});

describe("knockoutFirstRound — bordes", () => {
  it("un solo equipo no genera partido: pasa solo", () => {
    const { matches, byes } = knockoutFirstRound(["t1"]);
    expect(matches).toEqual([]);
    expect(byes).toEqual(["t1"]);
  });

  it("todos los partidos son de la ronda 1", () => {
    const { matches } = knockoutFirstRound(teams(16));
    matches.forEach((m) => expect(m.roundNumber).toBe(1));
  });
});
