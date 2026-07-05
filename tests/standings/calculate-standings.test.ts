import { describe, expect, it, vi } from "vitest";
import type { Prisma } from "@prisma/client";
import { MatchStatus } from "@prisma/client";
import { applyMatchResult } from "@/lib/standings/calculate-standings";
import type { MatchResult } from "@/lib/standings/utils";

/**
 * Tests unitarios de applyMatchResult con un TransactionClient falso.
 * Cubren la lógica crítica del producto: creación, edición, reversión,
 * WALKOVER, fases KNOCKOUT (no suman a la tabla general) y cambio de fase.
 */

type StatFields = {
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
};

const ZERO: StatFields = {
  matchesPlayed: 0,
  wins: 0,
  draws: 0,
  losses: 0,
  goalsFor: 0,
  goalsAgainst: 0,
  goalDifference: 0,
  points: 0,
};

function createFakeTx(phaseTypes: Record<string, string> = {}) {
  const tx = {
    tournamentPhase: {
      findUnique: vi.fn(async ({ where }: { where: { id: string } }) =>
        phaseTypes[where.id] ? { type: phaseTypes[where.id] } : null,
      ),
    },
    tournamentTeam: {
      update: vi.fn(async (_args: unknown) => ({})),
    },
    teamPhaseStats: {
      upsert: vi.fn(async (_args: unknown) => ({})),
    },
  };
  return tx;
}

type FakeTx = ReturnType<typeof createFakeTx>;

function asTx(tx: FakeTx): Prisma.TransactionClient {
  return tx as unknown as Prisma.TransactionClient;
}

/** Suma los increments aplicados a TournamentTeam (tabla general) para un equipo */
function globalDelta(tx: FakeTx, teamId: string): StatFields {
  const total = { ...ZERO };
  for (const call of tx.tournamentTeam.update.mock.calls) {
    const args = call[0] as {
      where: { id: string };
      data: Record<string, { increment: number }>;
    };
    if (args.where.id !== teamId) continue;
    for (const key of Object.keys(total) as (keyof StatFields)[]) {
      total[key] += args.data[key].increment;
    }
  }
  return total;
}

/** Suma los deltas aplicados a TeamPhaseStats para un equipo en una fase */
function phaseDelta(tx: FakeTx, teamId: string, phaseId: string): StatFields {
  const total = { ...ZERO };
  for (const call of tx.teamPhaseStats.upsert.mock.calls) {
    const args = call[0] as {
      where: {
        tournamentTeamId_tournamentPhaseId: {
          tournamentTeamId: string;
          tournamentPhaseId: string;
        };
      };
      create: Record<string, number | string>;
      update: Record<string, { increment: number }>;
    };
    const w = args.where.tournamentTeamId_tournamentPhaseId;
    if (w.tournamentTeamId !== teamId || w.tournamentPhaseId !== phaseId)
      continue;
    // upsert: create y update aplican el mismo delta; usamos update
    for (const key of Object.keys(total) as (keyof StatFields)[]) {
      total[key] += args.update[key].increment;
    }
  }
  return total;
}

function result(overrides: Partial<MatchResult>): MatchResult {
  return {
    homeTeamId: "home",
    awayTeamId: "away",
    homeScore: null,
    awayScore: null,
    status: MatchStatus.PROGRAMADO,
    tournamentPhaseId: null,
    ...overrides,
  };
}

const WIN_HOME_2_1: StatFields = {
  matchesPlayed: 1,
  wins: 1,
  draws: 0,
  losses: 0,
  goalsFor: 2,
  goalsAgainst: 1,
  goalDifference: 1,
  points: 3,
};

const LOSS_AWAY_1_2: StatFields = {
  matchesPlayed: 1,
  wins: 0,
  draws: 0,
  losses: 1,
  goalsFor: 1,
  goalsAgainst: 2,
  goalDifference: -1,
  points: 0,
};

describe("applyMatchResult — partido nuevo", () => {
  it("FINALIZADO 2-1 sin fase: suma a la tabla general, no toca fases", async () => {
    const tx = createFakeTx();
    await applyMatchResult(
      asTx(tx),
      null,
      result({ status: MatchStatus.FINALIZADO, homeScore: 2, awayScore: 1 }),
    );

    expect(globalDelta(tx, "home")).toEqual(WIN_HOME_2_1);
    expect(globalDelta(tx, "away")).toEqual(LOSS_AWAY_1_2);
    expect(tx.teamPhaseStats.upsert).not.toHaveBeenCalled();
    expect(tx.tournamentPhase.findUnique).not.toHaveBeenCalled();
  });

  it("empate 1-1: un punto para cada uno", async () => {
    const tx = createFakeTx();
    await applyMatchResult(
      asTx(tx),
      null,
      result({ status: MatchStatus.FINALIZADO, homeScore: 1, awayScore: 1 }),
    );

    expect(globalDelta(tx, "home").points).toBe(1);
    expect(globalDelta(tx, "away").points).toBe(1);
    expect(globalDelta(tx, "home").draws).toBe(1);
  });

  it("WALKOVER 3-0 computa como partido finalizado con puntos", async () => {
    const tx = createFakeTx();
    await applyMatchResult(
      asTx(tx),
      null,
      result({ status: MatchStatus.WALKOVER, homeScore: 3, awayScore: 0 }),
    );

    expect(globalDelta(tx, "home").points).toBe(3);
    expect(globalDelta(tx, "home").goalsFor).toBe(3);
    expect(globalDelta(tx, "away").losses).toBe(1);
  });

  it("PROGRAMADO no toca nada", async () => {
    const tx = createFakeTx();
    await applyMatchResult(asTx(tx), null, result({}));

    expect(tx.tournamentTeam.update).not.toHaveBeenCalled();
    expect(tx.teamPhaseStats.upsert).not.toHaveBeenCalled();
  });

  it("FINALIZADO sin marcador no computa", async () => {
    const tx = createFakeTx();
    await applyMatchResult(
      asTx(tx),
      null,
      result({ status: MatchStatus.FINALIZADO, homeScore: null, awayScore: 1 }),
    );

    expect(tx.tournamentTeam.update).not.toHaveBeenCalled();
  });
});

describe("applyMatchResult — ediciones y reversiones", () => {
  it("editar 2-1 → 2-2: aplica el delta neto correcto", async () => {
    const tx = createFakeTx();
    const prev = result({
      status: MatchStatus.FINALIZADO,
      homeScore: 2,
      awayScore: 1,
    });
    const next = result({
      status: MatchStatus.FINALIZADO,
      homeScore: 2,
      awayScore: 2,
    });

    await applyMatchResult(asTx(tx), prev, next);

    const home = globalDelta(tx, "home");
    // De victoria a empate: -3+1 puntos, -1 win, +1 draw, mismos PJ
    expect(home.points).toBe(-2);
    expect(home.wins).toBe(-1);
    expect(home.draws).toBe(1);
    expect(home.matchesPlayed).toBe(0);
    expect(home.goalsAgainst).toBe(1); // recibió un gol más

    const away = globalDelta(tx, "away");
    expect(away.points).toBe(1);
    expect(away.losses).toBe(-1);
  });

  it("revertir FINALIZADO 2-1 → SUSPENDIDO: resta todo", async () => {
    const tx = createFakeTx();
    const prev = result({
      status: MatchStatus.FINALIZADO,
      homeScore: 2,
      awayScore: 1,
    });
    const next = result({
      status: MatchStatus.SUSPENDIDO,
      homeScore: 2,
      awayScore: 1,
    });

    await applyMatchResult(asTx(tx), prev, next);

    expect(globalDelta(tx, "home")).toEqual(
      // `|| 0` normaliza el -0 de JavaScript al negar ceros
      Object.fromEntries(
        Object.entries(WIN_HOME_2_1).map(([k, v]) => [k, -v || 0]),
      ),
    );
  });

  it("sin cambios de resultado: los deltas se cancelan a cero", async () => {
    const tx = createFakeTx();
    const prev = result({
      status: MatchStatus.FINALIZADO,
      homeScore: 2,
      awayScore: 1,
    });

    await applyMatchResult(asTx(tx), prev, { ...prev });

    expect(globalDelta(tx, "home")).toEqual(ZERO);
    expect(globalDelta(tx, "away")).toEqual(ZERO);
  });
});

describe("applyMatchResult — fases", () => {
  it("fase GROUP: suma a la tabla general Y a la fase", async () => {
    const tx = createFakeTx({ "ph-group": "GROUP" });
    await applyMatchResult(
      asTx(tx),
      null,
      result({
        status: MatchStatus.FINALIZADO,
        homeScore: 2,
        awayScore: 1,
        tournamentPhaseId: "ph-group",
      }),
    );

    expect(globalDelta(tx, "home")).toEqual(WIN_HOME_2_1);
    expect(phaseDelta(tx, "home", "ph-group")).toEqual(WIN_HOME_2_1);
  });

  it("fase KNOCKOUT: NO suma a la tabla general, solo a la fase", async () => {
    const tx = createFakeTx({ "ph-ko": "KNOCKOUT" });
    await applyMatchResult(
      asTx(tx),
      null,
      result({
        status: MatchStatus.FINALIZADO,
        homeScore: 2,
        awayScore: 1,
        tournamentPhaseId: "ph-ko",
      }),
    );

    expect(tx.tournamentTeam.update).not.toHaveBeenCalled();
    expect(phaseDelta(tx, "home", "ph-ko")).toEqual(WIN_HOME_2_1);
    expect(phaseDelta(tx, "away", "ph-ko")).toEqual(LOSS_AWAY_1_2);
  });

  it("cambio de fase GROUP → KNOCKOUT: resta de la general y de la fase vieja, suma solo a la fase nueva", async () => {
    const tx = createFakeTx({ "ph-group": "GROUP", "ph-ko": "KNOCKOUT" });
    const prev = result({
      status: MatchStatus.FINALIZADO,
      homeScore: 2,
      awayScore: 1,
      tournamentPhaseId: "ph-group",
    });
    const next = { ...prev, tournamentPhaseId: "ph-ko" };

    await applyMatchResult(asTx(tx), prev, next);

    // La general queda con la resta neta (la fase nueva no suma)
    expect(globalDelta(tx, "home").points).toBe(-3);
    expect(globalDelta(tx, "home").matchesPlayed).toBe(-1);
    // Fase vieja restada, fase nueva sumada
    expect(phaseDelta(tx, "home", "ph-group").points).toBe(-3);
    expect(phaseDelta(tx, "home", "ph-ko").points).toBe(3);
  });

  it("fase desconocida en BD: por defecto suma puntos", async () => {
    const tx = createFakeTx(); // findUnique devuelve null
    await applyMatchResult(
      asTx(tx),
      null,
      result({
        status: MatchStatus.FINALIZADO,
        homeScore: 1,
        awayScore: 0,
        tournamentPhaseId: "ph-inexistente",
      }),
    );

    expect(globalDelta(tx, "home").points).toBe(3);
  });
});
