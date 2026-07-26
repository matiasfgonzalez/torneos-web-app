import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { PrismaClient } from "@/lib/generated/prisma/client";

import {
  applyMatchResult,
  extractMatchResult,
  recalculateTournamentStandings,
} from "@/lib/standings/calculate-standings";
import {
  aplicarMigraciones,
  clienteDeTests,
  hayBaseDeTests,
  limpiarBase,
} from "./setup";
import { crearLiga, crearPartido, tabla, type Liga } from "./fixtures";

/**
 * El invariante que sostiene toda la tabla de posiciones: **el camino
 * incremental y el recálculo completo tienen que dar lo mismo**.
 *
 * `applyMatchResult` actualiza la tabla sumando y restando deltas en cada
 * guardado (rápido, y lo que corre en producción). `recalculateTournamentStandings`
 * la rehace desde cero leyendo todos los partidos. Si divergen, la tabla se va
 * desviando de a poco y **nadie se entera**: no hay excepción, no hay log, solo
 * un torneo con los puntos mal. Es exactamente lo que ningún test de lógica pura
 * puede ver, porque el bug vive en cómo las dos rutas tocan la base.
 */
describe.skipIf(!(await hayBaseDeTests()))("standings: incremental vs recálculo", () => {
  let db: PrismaClient;
  let liga: Liga;

  beforeAll(() => {
    aplicarMigraciones();
    db = clienteDeTests();
  });

  afterAll(async () => {
    await db?.$disconnect();
  });

  beforeEach(async () => {
    await limpiarBase(db);
    liga = await crearLiga(db, { equipos: 4 });
  });

  /** Guarda un partido como lo hace la ruta: en transacción y aplicando el delta. */
  async function guardarPartido(
    local: number,
    visitante: number,
    gl: number,
    gv: number,
  ) {
    const match = await crearPartido(db, liga, local, visitante, gl, gv);
    await db.$transaction(async (tx) => {
      await applyMatchResult(tx, null, extractMatchResult(match));
    });
    return match;
  }

  it("una fecha completa: los deltas dan igual que rehacer la tabla", async () => {
    await guardarPartido(0, 1, 2, 1); // gana local
    await guardarPartido(2, 3, 0, 0); // empate

    const incremental = await tabla(db, liga.tournamentId);
    await recalculateTournamentStandings(liga.tournamentId);
    const recalculada = await tabla(db, liga.tournamentId);

    expect(incremental).toEqual(recalculada);
    // Y los números son los correctos, no solo iguales entre sí.
    const porId = Object.fromEntries(recalculada.map((f) => [f.id, f]));
    expect(porId[liga.equipos[0]].points).toBe(3);
    expect(porId[liga.equipos[1]].points).toBe(0);
    expect(porId[liga.equipos[2]].points).toBe(1);
    expect(porId[liga.equipos[3]].points).toBe(1);
  });

  it("editar un resultado revierte el anterior (no lo suma dos veces)", async () => {
    const match = await guardarPartido(0, 1, 2, 1);

    // El organizador corrige el marcador: 2-1 pasa a 1-3.
    const previo = extractMatchResult(match);
    const actualizado = await db.match.update({
      where: { id: match.id },
      data: { homeScore: 1, awayScore: 3 },
    });
    await db.$transaction(async (tx) => {
      await applyMatchResult(tx, previo, extractMatchResult(actualizado));
    });

    const incremental = await tabla(db, liga.tournamentId);
    await recalculateTournamentStandings(liga.tournamentId);
    expect(incremental).toEqual(await tabla(db, liga.tournamentId));

    const porId = Object.fromEntries(incremental.map((f) => [f.id, f]));
    expect(porId[liga.equipos[0]].matchesPlayed).toBe(1); // no 2
    expect(porId[liga.equipos[0]].points).toBe(0);
    expect(porId[liga.equipos[1]].points).toBe(3);
  });

  it("un partido que deja de contar se resta de la tabla", async () => {
    const match = await guardarPartido(0, 1, 2, 1);
    const previo = extractMatchResult(match);

    // Se suspende: deja de ser computable.
    const suspendido = await db.match.update({
      where: { id: match.id },
      data: { status: "SUSPENDIDO" },
    });
    await db.$transaction(async (tx) => {
      await applyMatchResult(tx, previo, extractMatchResult(suspendido));
    });

    const incremental = await tabla(db, liga.tournamentId);
    await recalculateTournamentStandings(liga.tournamentId);
    expect(incremental).toEqual(await tabla(db, liga.tournamentId));
    expect(incremental.every((f) => f.matchesPlayed === 0)).toBe(true);
    expect(incremental.every((f) => f.points === 0)).toBe(true);
  });

  it("el WALKOVER cuenta como partido jugado", async () => {
    const match = await db.match.create({
      data: {
        dateTime: new Date("2026-03-08T20:00:00Z"),
        tournamentId: liga.tournamentId,
        homeTeamId: liga.equipos[0],
        awayTeamId: liga.equipos[1],
        homeScore: 3,
        awayScore: 0,
        status: "WALKOVER",
        walkoverWinnerTeamId: liga.equipos[0],
      },
    });
    await db.$transaction(async (tx) => {
      await applyMatchResult(tx, null, extractMatchResult(match));
    });

    const incremental = await tabla(db, liga.tournamentId);
    await recalculateTournamentStandings(liga.tournamentId);
    expect(incremental).toEqual(await tabla(db, liga.tournamentId));

    const porId = Object.fromEntries(incremental.map((f) => [f.id, f]));
    expect(porId[liga.equipos[0]].points).toBe(3);
    expect(porId[liga.equipos[0]].matchesPlayed).toBe(1);
  });

  it("respeta el puntaje configurado del torneo (N7), no el 3-1-0 por defecto", async () => {
    // Un torneo con 2 puntos por ganar: si el recálculo ignorara la config y
    // usara el default, las dos tablas dejarían de coincidir.
    await db.tournament.update({
      where: { id: liga.tournamentId },
      data: { pointsWin: 2, pointsDraw: 1, pointsLoss: 0 },
    });

    const match = await crearPartido(db, liga, 0, 1, 1, 0);
    await db.$transaction(async (tx) => {
      await applyMatchResult(tx, null, extractMatchResult(match), {
        pointsWin: 2,
        pointsDraw: 1,
        pointsLoss: 0,
      });
    });

    const incremental = await tabla(db, liga.tournamentId);
    await recalculateTournamentStandings(liga.tournamentId);
    expect(incremental).toEqual(await tabla(db, liga.tournamentId));

    const ganador = incremental.find((f) => f.id === liga.equipos[0]);
    expect(ganador?.points).toBe(2);
  });

  it("los partidos de una fase KNOCKOUT no suman a la tabla general (C6)", async () => {
    const fase = await db.tournamentPhase.create({
      data: {
        tournamentId: liga.tournamentId,
        name: "Final",
        order: 2,
        type: "KNOCKOUT",
      },
    });

    const match = await db.match.create({
      data: {
        dateTime: new Date("2026-06-01T20:00:00Z"),
        tournamentId: liga.tournamentId,
        homeTeamId: liga.equipos[0],
        awayTeamId: liga.equipos[1],
        homeScore: 2,
        awayScore: 0,
        status: "FINALIZADO",
        tournamentPhaseId: fase.id,
      },
    });
    await db.$transaction(async (tx) => {
      await applyMatchResult(tx, null, extractMatchResult(match));
    });

    const incremental = await tabla(db, liga.tournamentId);
    await recalculateTournamentStandings(liga.tournamentId);
    expect(incremental).toEqual(await tabla(db, liga.tournamentId));

    // La final de la copa no puede mover el descenso: cero en la tabla general.
    expect(incremental.every((f) => f.points === 0)).toBe(true);
    expect(incremental.every((f) => f.matchesPlayed === 0)).toBe(true);
  });
});
