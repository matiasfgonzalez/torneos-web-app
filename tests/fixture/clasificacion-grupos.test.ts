import { describe, it, expect } from "vitest";
import {
  CupSeedError,
  planCupRound,
  teamsFromGroups,
  type GroupStanding,
} from "@/lib/fixture/cups";

/**
 * Clasificación desde una fase de grupos (formato Mundial): los primeros N de
 * cada grupo + los mejores M de la posición siguiente.
 */

/**
 * 12 grupos de 4, como el Mundial. El equipo `g{N}p{P}` es el que quedó en la
 * posición P del grupo N. El rendimiento global se simula: mejor grupo primero,
 * y dentro del grupo, mejor posición primero.
 */
function mundial() {
  const groups: GroupStanding[] = [];
  const globalRank: string[] = [];
  // Primero todos los 1°, después los 2°, después los 3°, después los 4°: así
  // el globalRank tiene a los terceros ordenados por la "calidad" de su grupo.
  for (let p = 1; p <= 4; p++) {
    for (let g = 1; g <= 12; g++) {
      globalRank.push(`g${g}p${p}`);
    }
  }
  for (let g = 1; g <= 12; g++) {
    groups.push({
      name: String.fromCodePoint(64 + g),
      teamIds: [1, 2, 3, 4].map((p) => `g${g}p${p}`),
    });
  }
  return { groups, globalRank };
}

describe("teamsFromGroups", () => {
  it("Mundial: 2 por grupo + 8 mejores terceros = 32 clasificados", () => {
    const { groups, globalRank } = mundial();
    const clasificados = teamsFromGroups({
      groups,
      globalRank,
      qualifyPerGroup: 2,
      bestCount: 8,
    });

    expect(clasificados).toHaveLength(32);

    // Los 24 primeros y segundos, todos presentes.
    for (let g = 1; g <= 12; g++) {
      expect(clasificados).toContain(`g${g}p1`);
      expect(clasificados).toContain(`g${g}p2`);
    }
    // Exactamente 8 terceros, y son los de los grupos mejor rankeados (g1..g8).
    const terceros = clasificados.filter((id) => id.endsWith("p3"));
    expect(terceros.sort()).toEqual(
      ["g1p3", "g2p3", "g3p3", "g4p3", "g5p3", "g6p3", "g7p3", "g8p3"].sort(),
    );
    // Ningún cuarto clasifica.
    expect(clasificados.some((id) => id.endsWith("p4"))).toBe(false);
  });

  it("vienen ordenados por rendimiento global (para sembrar por nivel)", () => {
    const { groups, globalRank } = mundial();
    const clasificados = teamsFromGroups({
      groups,
      globalRank,
      qualifyPerGroup: 2,
      bestCount: 8,
    });
    // El primero de la lista es el mejor del globalRank que clasificó.
    expect(clasificados[0]).toBe("g1p1");
    // Está ordenada de forma no decreciente según el globalRank.
    const rank = new Map(globalRank.map((id, i) => [id, i]));
    for (let i = 1; i < clasificados.length; i++) {
      expect(rank.get(clasificados[i])!).toBeGreaterThan(
        rank.get(clasificados[i - 1])!,
      );
    }
  });

  it("sin repechaje (bestCount 0): solo los directos", () => {
    const { groups, globalRank } = mundial();
    const clasificados = teamsFromGroups({
      groups,
      globalRank,
      qualifyPerGroup: 2,
      bestCount: 0,
    });
    expect(clasificados).toHaveLength(24);
    expect(clasificados.every((id) => !id.endsWith("p3") && !id.endsWith("p4"))).toBe(true);
  });

  it("un grupo con menos equipos que la posición de repechaje no aporta candidato", () => {
    const groups: GroupStanding[] = [
      { name: "A", teamIds: ["a1", "a2", "a3"] },
      { name: "B", teamIds: ["b1", "b2"] }, // no tiene 3°
    ];
    const globalRank = ["a1", "b1", "a2", "b2", "a3"];
    const clasificados = teamsFromGroups({
      groups,
      globalRank,
      qualifyPerGroup: 2,
      bestCount: 4,
    });
    // 4 directos + el único tercero que existe (a3).
    expect(clasificados.sort()).toEqual(["a1", "a2", "a3", "b1", "b2"].sort());
  });

  it("rechaza qualifyPerGroup inválido", () => {
    const { groups, globalRank } = mundial();
    expect(() =>
      teamsFromGroups({ groups, globalRank, qualifyPerGroup: 0, bestCount: 8 }),
    ).toThrow(CupSeedError);
  });
});

describe("planCupRound con GROUP_POSITION", () => {
  it("Mundial: arma los 16avos → 16 partidos, ningún bye", () => {
    const { groups, globalRank } = mundial();
    const plan = planCupRound({
      source: "GROUP_POSITION",
      groups,
      globalRank,
      qualifyPerGroup: 2,
      bestCount: 8,
    });

    expect(plan.teamIds).toHaveLength(32);
    expect(plan.matches).toHaveLength(16);
    expect(plan.byes).toHaveLength(0);
    expect(plan.roundName).toBe("Dieciseisavos de final");
  });

  it("siembra el cuadro: el 1° global no se cruza con el 2° hasta la final", () => {
    const { groups, globalRank } = mundial();
    const plan = planCupRound({
      source: "GROUP_POSITION",
      groups,
      globalRank,
      qualifyPerGroup: 2,
      bestCount: 8,
    });
    // El mejor sembrado enfrenta al peor clasificado en primera ronda.
    const primerCruce = plan.matches[0];
    expect(primerCruce.homeTeamId).toBe("g1p1"); // 1° del ranking
    // Su rival es el último de los 32 clasificados (un repechado).
    expect(primerCruce.awayTeamId).toBe(plan.teamIds[31]);
  });

  it("la cadena sigue con WINNERS: 16 ganadores → octavos (8 partidos)", () => {
    // Simula que se jugaron los 16avos: gana siempre el local.
    const { groups, globalRank } = mundial();
    const dieciseisavos = planCupRound({
      source: "GROUP_POSITION",
      groups,
      globalRank,
      qualifyPerGroup: 2,
      bestCount: 8,
    });
    const results = dieciseisavos.matches.map((m) => ({
      homeTeamId: m.homeTeamId,
      awayTeamId: m.awayTeamId,
      winnerTeamId: m.homeTeamId,
    }));

    const octavos = planCupRound({ source: "WINNERS", results });
    expect(octavos.matches).toHaveLength(8);
    expect(octavos.roundName).toBe("Octavos de final");
  });
});
