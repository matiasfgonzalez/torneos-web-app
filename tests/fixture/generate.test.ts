import { describe, expect, it } from "vitest";
import { generateFixture } from "@/lib/fixture/generate";
import { distributeIntoGroups, groupName } from "@/lib/fixture/groups";
import { scheduleMatches } from "@/lib/fixture/schedule";
import { shuffle } from "@/lib/fixture/shuffle";
import {
  reasonWithoutGenerator,
  supportsFixture,
} from "@/lib/fixture/formats";

const teams = (n: number) => Array.from({ length: n }, (_, i) => `t${i + 1}`);

describe("distributeIntoGroups", () => {
  it("reparte parejo cuando divide exacto", () => {
    const groups = distributeIntoGroups(teams(8), 2);
    expect(groups).toHaveLength(2);
    expect(groups[0]).toHaveLength(4);
    expect(groups[1]).toHaveLength(4);
  });

  it("con resto, los primeros grupos quedan con uno más", () => {
    const groups = distributeIntoGroups(teams(7), 2);
    expect(groups.map((g) => g.length).sort((a, b) => b - a)).toEqual([4, 3]);
  });

  it("no pierde ni duplica equipos", () => {
    const groups = distributeIntoGroups(teams(11), 3);
    const all = groups.flat();
    expect(all).toHaveLength(11);
    expect(new Set(all).size).toBe(11);
  });

  it("reparte en serpiente: los dos primeros sembrados no caen juntos", () => {
    const groups = distributeIntoGroups(teams(8), 2);
    expect(groups[0][0]).toBe("t1");
    expect(groups[1][0]).toBe("t2");
  });

  it("rechaza más grupos que equipos", () => {
    expect(() => distributeIntoGroups(teams(2), 3)).toThrow(/más grupos/i);
  });

  it("rechaza cero grupos", () => {
    expect(() => distributeIntoGroups(teams(4), 0)).toThrow(/al menos un grupo/i);
  });
});

describe("groupName", () => {
  it("nombra A, B, C…", () => {
    expect(groupName(0)).toBe("A");
    expect(groupName(1)).toBe("B");
    expect(groupName(25)).toBe("Z");
  });
});

describe("shuffle", () => {
  it("sin semilla conserva el orden de inscripción", () => {
    expect(shuffle(teams(5))).toEqual(teams(5));
  });

  it("la misma semilla da siempre el mismo sorteo", () => {
    expect(shuffle(teams(10), 42)).toEqual(shuffle(teams(10), 42));
  });

  it("semillas distintas dan sorteos distintos", () => {
    expect(shuffle(teams(10), 1)).not.toEqual(shuffle(teams(10), 2));
  });

  it("no pierde ni duplica equipos", () => {
    const result = shuffle(teams(10), 7);
    expect(new Set(result)).toEqual(new Set(teams(10)));
  });

  it("no muta el arreglo original", () => {
    const original = teams(5);
    shuffle(original, 3);
    expect(original).toEqual(teams(5));
  });
});

describe("formats", () => {
  it("los formatos de liga usan round-robin", () => {
    expect(supportsFixture("LIGA")).toBe(true);
    expect(supportsFixture("IDA_Y_VUELTA")).toBe(true);
    expect(supportsFixture("TODOS_CONTRA_TODOS")).toBe(true);
  });

  it("grupos y llaves están soportados", () => {
    expect(supportsFixture("GRUPOS")).toBe(true);
    expect(supportsFixture("ELIMINACION_DIRECTA")).toBe(true);
    expect(supportsFixture("COPA")).toBe(true);
  });

  it("los formatos sin generador se declaran con su motivo", () => {
    expect(supportsFixture("SUIZO")).toBe(false);
    expect(reasonWithoutGenerator("SUIZO")).toMatch(/ronda/i);
    expect(supportsFixture("DOBLE_ELIMINACION")).toBe(false);
    expect(reasonWithoutGenerator("DOBLE_ELIMINACION")).toBeTruthy();
  });
});

describe("generateFixture — liga", () => {
  it("crea una fase LEAGUE con todos los cruces", () => {
    const plan = generateFixture("LIGA", teams(6), { homeAndAway: false });
    expect(plan.phases).toHaveLength(1);
    expect(plan.phases[0].type).toBe("LEAGUE");
    expect(plan.totalMatches).toBe(15); // C(6,2)
    expect(plan.byes).toEqual([]);
  });

  it("ida y vuelta duplica los partidos y lo dice en el nombre de la fase", () => {
    const plan = generateFixture("LIGA", teams(6), { homeAndAway: true });
    expect(plan.totalMatches).toBe(30);
    expect(plan.phases[0].name).toMatch(/ida y vuelta/i);
  });
});

describe("generateFixture — grupos", () => {
  it("crea una fase GROUP y asigna grupo a cada equipo", () => {
    const plan = generateFixture("GRUPOS", teams(8), {
      homeAndAway: false,
      groupCount: 2,
    });

    expect(plan.phases[0].type).toBe("GROUP");
    expect(Object.keys(plan.groupAssignments ?? {})).toHaveLength(8);
    // 2 grupos de 4 → C(4,2) * 2 = 12
    expect(plan.totalMatches).toBe(12);
  });

  it("cada partido lleva el grupo al que pertenece", () => {
    const plan = generateFixture("GRUPOS", teams(8), {
      homeAndAway: false,
      groupCount: 2,
    });
    plan.phases[0].matches.forEach((m) => expect(m.group).toMatch(/^[AB]$/));
  });

  it("nadie juega contra un equipo de otro grupo", () => {
    const plan = generateFixture("GRUPOS", teams(8), {
      homeAndAway: false,
      groupCount: 2,
    });
    const assignments = plan.groupAssignments ?? {};

    plan.phases[0].matches.forEach((m) => {
      expect(assignments[m.homeTeamId]).toBe(assignments[m.awayTeamId]);
      expect(assignments[m.homeTeamId]).toBe(m.group);
    });
  });
});

describe("generateFixture — eliminación directa", () => {
  it("crea una fase KNOCKOUT con la primera ronda", () => {
    const plan = generateFixture("ELIMINACION_DIRECTA", teams(8), {
      homeAndAway: false,
    });
    expect(plan.phases[0].type).toBe("KNOCKOUT");
    expect(plan.phases[0].name).toBe("Cuartos de final");
    expect(plan.totalMatches).toBe(4);
  });

  it("reporta los byes para que el organizador se entere", () => {
    const plan = generateFixture("COPA", teams(6), { homeAndAway: false });
    expect(plan.byes).toHaveLength(2);
    expect(plan.totalMatches).toBe(2);
  });
});

describe("generateFixture — errores", () => {
  it("rechaza un formato sin generador, con el motivo", () => {
    expect(() => generateFixture("SUIZO", teams(8), { homeAndAway: false })).toThrow(
      /ronda/i,
    );
  });

  it("rechaza menos de 2 equipos", () => {
    expect(() => generateFixture("LIGA", ["t1"], { homeAndAway: false })).toThrow(
      /al menos 2 equipos/i,
    );
  });
});

describe("generateFixture — reproducibilidad", () => {
  it("la misma semilla genera el mismo fixture", () => {
    const a = generateFixture("LIGA", teams(8), { homeAndAway: false, seed: 99 });
    const b = generateFixture("LIGA", teams(8), { homeAndAway: false, seed: 99 });
    expect(a.phases[0].matches).toEqual(b.phases[0].matches);
  });
});

describe("scheduleMatches", () => {
  const start = new Date(2026, 7, 1, 20, 0); // 1 ago 2026, 20:00 local

  it("la primera jornada cae en la fecha de inicio", () => {
    const [first] = scheduleMatches(
      [{ homeTeamId: "a", awayTeamId: "b", roundNumber: 1 }],
      { startDate: start, intervalDays: 7 },
    );
    expect(first.dateTime).toEqual(start);
  });

  it("cada jornada cae un intervalo después", () => {
    const scheduled = scheduleMatches(
      [
        { homeTeamId: "a", awayTeamId: "b", roundNumber: 1 },
        { homeTeamId: "c", awayTeamId: "d", roundNumber: 3 },
      ],
      { startDate: start, intervalDays: 7 },
    );
    expect(scheduled[1].dateTime.getDate()).toBe(15); // 1 + 2*7
  });

  it("los partidos de la misma jornada comparten fecha y hora", () => {
    const scheduled = scheduleMatches(
      [
        { homeTeamId: "a", awayTeamId: "b", roundNumber: 2 },
        { homeTeamId: "c", awayTeamId: "d", roundNumber: 2 },
      ],
      { startDate: start, intervalDays: 7 },
    );
    expect(scheduled[0].dateTime).toEqual(scheduled[1].dateTime);
  });

  it("conserva la hora local al cruzar meses", () => {
    const scheduled = scheduleMatches(
      [{ homeTeamId: "a", awayTeamId: "b", roundNumber: 6 }],
      { startDate: start, intervalDays: 7 },
    );
    // 1 ago + 35 días = 5 sep, misma hora
    expect(scheduled[0].dateTime.getMonth()).toBe(8);
    expect(scheduled[0].dateTime.getDate()).toBe(5);
    expect(scheduled[0].dateTime.getHours()).toBe(20);
  });
});
