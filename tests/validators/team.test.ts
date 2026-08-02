import { describe, expect, it } from "vitest";
import { teamCreateSchema, teamUpdateSchema } from "@/lib/validators/team";
import {
  tournamentTeamCreateSchema,
  tournamentTeamUpdateSchema,
} from "@/lib/validators/tournament-team";
import { teamPlayerCreateSchema } from "@/lib/validators/team-player";

/**
 * A8 — validadores de equipo, inscripción al torneo y plantel.
 *
 * El caso que más importa acá es el de `tournament-team`: la API dejó de aceptar
 * estadísticas de la tabla de posiciones (F3, punto 5 de C6). Si el esquema
 * volviera a admitirlas habría otra vez doble fuente de verdad — el cliente
 * escribiendo puntos que el recálculo pisa —, y nada más en el repo lo impide.
 */

describe("teamCreateSchema", () => {
  const base = { name: "Atlético Central", yearFounded: 1985 };

  it("acepta el mínimo: nombre y año de fundación", () => {
    expect(teamCreateSchema.safeParse(base).success).toBe(true);
  });

  it("exige el año de fundación al crear", () => {
    expect(teamCreateSchema.safeParse({ name: "Atlético" }).success).toBe(false);
  });

  it("rechaza un nombre en blanco", () => {
    expect(teamCreateSchema.safeParse({ ...base, name: "   " }).success).toBe(
      false,
    );
  });

  it("coerciona el año que llega como texto del formulario", () => {
    expect(teamCreateSchema.parse({ ...base, yearFounded: "1985" }).yearFounded)
      .toBe(1985);
  });

  it("rechaza un año anterior a 1900", () => {
    expect(
      teamCreateSchema.safeParse({ ...base, yearFounded: 1899 }).success,
    ).toBe(false);
  });

  it("rechaza un año en el futuro", () => {
    const añoQueViene = new Date().getFullYear() + 1;
    expect(
      teamCreateSchema.safeParse({ ...base, yearFounded: añoQueViene }).success,
    ).toBe(false);
  });

  it("los opcionales vacíos quedan en null", () => {
    const result = teamCreateSchema.parse({ ...base, coach: "", shortName: "" });
    expect(result.coach).toBeNull();
    expect(result.shortName).toBeNull();
  });

  it("descarta campos no declarados (C2)", () => {
    const result = teamCreateSchema.parse({ ...base, id: "falso", userId: "x" });
    expect(result).not.toHaveProperty("id");
    expect(result).not.toHaveProperty("userId");
  });
});

describe("teamUpdateSchema", () => {
  it("acepta una edición parcial", () => {
    expect(teamUpdateSchema.safeParse({ coach: "R. Pérez" }).success).toBe(true);
    expect(teamUpdateSchema.safeParse({}).success).toBe(true);
  });

  it("sigue validando lo que viene", () => {
    expect(teamUpdateSchema.safeParse({ yearFounded: 1800 }).success).toBe(
      false,
    );
  });
});

describe("tournamentTeamCreateSchema", () => {
  const base = { tournamentId: "trn_1", teamId: "eq_1" };

  it("acepta la inscripción con torneo y equipo", () => {
    expect(tournamentTeamCreateSchema.safeParse(base).success).toBe(true);
  });

  it.each(["tournamentId", "teamId"])("rechaza si falta %s", (campo) => {
    const payload: Record<string, unknown> = { ...base };
    delete payload[campo];
    expect(tournamentTeamCreateSchema.safeParse(payload).success).toBe(false);
  });

  it("acepta grupo, notas y el flag de eliminado", () => {
    const result = tournamentTeamCreateSchema.parse({
      ...base,
      group: "A",
      isEliminated: false,
      notes: "Adeuda la inscripción",
    });
    expect(result.group).toBe("A");
    expect(result.isEliminated).toBe(false);
  });

  it("NO acepta estadísticas de la tabla: las descarta todas (F3 / C6)", () => {
    const result = tournamentTeamCreateSchema.parse({
      ...base,
      matchesPlayed: 9,
      wins: 9,
      draws: 0,
      losses: 0,
      goalsFor: 40,
      goalsAgainst: 0,
      goalDifference: 40,
      points: 27,
    });
    for (const stat of [
      "matchesPlayed",
      "wins",
      "draws",
      "losses",
      "goalsFor",
      "goalsAgainst",
      "goalDifference",
      "points",
    ]) {
      expect(result).not.toHaveProperty(stat);
    }
  });

  it("tampoco por la vía de la edición", () => {
    const result = tournamentTeamUpdateSchema.parse({ points: 99, group: "B" });
    expect(result).not.toHaveProperty("points");
    expect(result.group).toBe("B");
  });
});

describe("teamPlayerCreateSchema", () => {
  const base = { tournamentTeamId: "tt_1", playerId: "jug_1" };

  it("acepta el alta con la asociación mínima", () => {
    expect(teamPlayerCreateSchema.safeParse(base).success).toBe(true);
  });

  it.each(["tournamentTeamId", "playerId"])(
    "rechaza si falta %s",
    (campo) => {
      const payload: Record<string, unknown> = { ...base };
      delete payload[campo];
      expect(teamPlayerCreateSchema.safeParse(payload).success).toBe(false);
    },
  );

  it("una fecha de alta vacía queda en undefined para que Prisma aplique @default(now())", () => {
    // Distinto de `null`: `null` intentaría escribir NULL en una columna que no
    // lo admite. `undefined` es "no lo mandes y dejá que la base ponga la fecha".
    const result = teamPlayerCreateSchema.parse({ ...base, joinedAt: "" });
    expect(result.joinedAt).toBeUndefined();
  });

  it("coerciona la fecha de alta cuando sí viene", () => {
    const result = teamPlayerCreateSchema.parse({
      ...base,
      joinedAt: "2025-02-01T00:00:00.000Z",
    });
    expect(result.joinedAt).toBeInstanceOf(Date);
  });

  it("la fecha de baja vacía queda en null (sigue en el plantel)", () => {
    expect(teamPlayerCreateSchema.parse({ ...base, leftAt: "" }).leftAt)
      .toBeNull();
  });

  it("acota el número de camiseta", () => {
    expect(
      teamPlayerCreateSchema.safeParse({ ...base, number: 1000 }).success,
    ).toBe(false);
    expect(teamPlayerCreateSchema.parse({ ...base, number: "10" }).number).toBe(
      10,
    );
  });

  it("rechaza un estado de jugador inventado", () => {
    expect(
      teamPlayerCreateSchema.safeParse({ ...base, status: "CEDIDO" }).success,
    ).toBe(false);
    expect(
      teamPlayerCreateSchema.safeParse({ ...base, status: "LESIONADO" }).success,
    ).toBe(true);
  });
});
