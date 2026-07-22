import { describe, it, expect } from "vitest";
import { groupByExisting } from "@/lib/fixture/groups";
import { generateFixture } from "@/lib/fixture/generate";

/**
 * Respetar los grupos que ya asignó la liga (bombos, acto público, o cargar a
 * mano los grupos reales de un torneo existente).
 *
 * El bug que esto evita: `distributeIntoGroups` repartía por su cuenta y pisaba
 * la asignación, y como los partidos se arman sobre los grupos resultantes,
 * corregirlos después no arreglaba el fixture.
 */

/** 48 equipos en 12 grupos de 4, como el Mundial. */
const mundial = () => {
  const teamIds: string[] = [];
  const groupOf: Record<string, string> = {};
  for (let g = 0; g < 12; g++) {
    const name = String.fromCodePoint(65 + g);
    for (let i = 0; i < 4; i++) {
      const id = `${name}${i + 1}`;
      teamIds.push(id);
      groupOf[id] = name;
    }
  }
  return { teamIds, groupOf };
};

describe("groupByExisting", () => {
  it("agrupa por el grupo asignado, ordenado por nombre", () => {
    const zonas = groupByExisting(
      ["t1", "t2", "t3", "t4"],
      { t1: "B", t2: "A", t3: "B", t4: "A" },
    );
    expect(zonas).toEqual([
      { name: "A", teamIds: ["t2", "t4"] },
      { name: "B", teamIds: ["t1", "t3"] },
    ]);
  });

  it("rechaza equipos sin grupo con un mensaje accionable", () => {
    expect(() =>
      groupByExisting(["t1", "t2"], { t1: "A" }),
    ).toThrow(/sin grupo asignado/);
  });

  it("rechaza un grupo con un solo equipo (no se pueden armar partidos)", () => {
    expect(() =>
      groupByExisting(["t1", "t2", "t3"], { t1: "A", t2: "A", t3: "B" }),
    ).toThrow(/"B" tiene un solo equipo/);
  });

  it("ignora espacios alrededor del nombre del grupo", () => {
    const zonas = groupByExisting(["t1", "t2"], { t1: " A ", t2: "A" });
    expect(zonas).toEqual([{ name: "A", teamIds: ["t1", "t2"] }]);
  });
});

describe("generateFixture con grupos ya asignados", () => {
  it("el Mundial: 12 grupos de 4 → 72 partidos, 6 por grupo", () => {
    const { teamIds, groupOf } = mundial();

    const plan = generateFixture("GRUPOS", teamIds, {
      homeAndAway: false,
      existingGroups: groupOf,
    });

    expect(plan.totalMatches).toBe(72);

    const porGrupo = new Map<string, number>();
    for (const m of plan.phases[0].matches) {
      porGrupo.set(m.group!, (porGrupo.get(m.group!) ?? 0) + 1);
    }
    expect(porGrupo.size).toBe(12);
    expect([...porGrupo.values()].every((n) => n === 6)).toBe(true);
  });

  it("NO devuelve groupAssignments: es lo que evita que el server los pise", () => {
    const { teamIds, groupOf } = mundial();
    const plan = generateFixture("GRUPOS", teamIds, {
      homeAndAway: false,
      existingGroups: groupOf,
    });
    expect(plan.groupAssignments).toBeUndefined();
  });

  it("ningún partido cruza equipos de grupos distintos", () => {
    const { teamIds, groupOf } = mundial();
    const plan = generateFixture("GRUPOS", teamIds, {
      homeAndAway: false,
      existingGroups: groupOf,
    });

    for (const m of plan.phases[0].matches) {
      expect(groupOf[m.homeTeamId]).toBe(m.group);
      expect(groupOf[m.awayTeamId]).toBe(m.group);
    }
  });

  it("sin `existingGroups` sigue repartiendo y sí devuelve las asignaciones", () => {
    const { teamIds } = mundial();
    const plan = generateFixture("GRUPOS", teamIds, {
      homeAndAway: false,
      groupCount: 12,
    });
    // El comportamiento viejo no cambia: reparte y le dice al server qué escribir.
    expect(plan.groupAssignments).toBeDefined();
    expect(Object.keys(plan.groupAssignments!)).toHaveLength(48);
  });

  it("respeta ida y vuelta dentro de cada grupo", () => {
    const { teamIds, groupOf } = mundial();
    const plan = generateFixture("GRUPOS", teamIds, {
      homeAndAway: true,
      existingGroups: groupOf,
    });
    expect(plan.totalMatches).toBe(144);
  });
});
