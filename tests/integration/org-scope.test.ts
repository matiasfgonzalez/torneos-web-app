import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { PrismaClient } from "@/lib/generated/prisma/client";

import { orgScopeWhere, canViewInPanel } from "@/lib/orgAuth";
import {
  aplicarMigraciones,
  clienteDeTests,
  hayBaseDeTests,
  limpiarBase,
} from "./setup";
import { crearLiga } from "./fixtures";

/**
 * `orgScopeWhere` es el aislamiento entre ligas (N3): decide qué ve cada
 * organizador en su panel. Como función es de una línea y un test unitario dice
 * poco —comparar un objeto contra sí mismo—; lo que importa es **qué devuelve
 * Prisma cuando ese objeto se usa de verdad**.
 *
 * Es el caso de error silencioso por excelencia: si el `where` deja de filtrar,
 * nada falla, nada tira, y un organizador simplemente empieza a ver los torneos
 * de otra liga. Ningún test de lógica pura lo detecta.
 */
describe.skipIf(!(await hayBaseDeTests()))("orgScopeWhere contra la base", () => {
  let db: PrismaClient;
  let ligaA: Awaited<ReturnType<typeof crearLiga>>;
  let ligaB: Awaited<ReturnType<typeof crearLiga>>;

  beforeAll(() => {
    aplicarMigraciones();
    db = clienteDeTests();
  });

  afterAll(async () => {
    await db?.$disconnect();
  });

  beforeEach(async () => {
    await limpiarBase(db);
    ligaA = await crearLiga(db, { nombre: "Liga A", equipos: 2 });
    ligaB = await crearLiga(db, { nombre: "Liga B", equipos: 2 });
  });

  it("con una organización, trae SOLO los torneos de esa organización", async () => {
    const torneos = await db.tournament.findMany({
      where: { deletedAt: null, ...orgScopeWhere([ligaA.orgId]) },
      select: { id: true, organizationId: true },
    });

    expect(torneos).toHaveLength(1);
    expect(torneos[0].id).toBe(ligaA.tournamentId);
    expect(torneos[0].organizationId).toBe(ligaA.orgId);
  });

  it("no filtra de menos: el torneo de la otra liga no aparece", async () => {
    const torneos = await db.tournament.findMany({
      where: orgScopeWhere([ligaA.orgId]),
      select: { id: true },
    });
    expect(torneos.map((t) => t.id)).not.toContain(ligaB.tournamentId);
  });

  it("no filtra de más: con las dos organizaciones trae los dos torneos", async () => {
    const torneos = await db.tournament.findMany({
      where: orgScopeWhere([ligaA.orgId, ligaB.orgId]),
      select: { id: true },
    });
    expect(torneos.map((t) => t.id).sort()).toEqual(
      [ligaA.tournamentId, ligaB.tournamentId].sort(),
    );
  });

  it("`null` (ADMINISTRADOR sin 'ver como') trae todo", async () => {
    const torneos = await db.tournament.findMany({
      where: orgScopeWhere(null),
      select: { id: true },
    });
    expect(torneos).toHaveLength(2);
  });

  it("con lista vacía (usuario sin ligas) no trae nada", async () => {
    // El caso que más duele si se rompe: `{ in: [] }` tiene que dar cero filas,
    // no todas. Un `where` mal armado acá le mostraría el panel entero a
    // cualquier usuario recién registrado.
    const torneos = await db.tournament.findMany({
      where: orgScopeWhere([]),
      select: { id: true },
    });
    expect(torneos).toEqual([]);
  });

  it("aplica igual sobre equipos, no solo sobre torneos", async () => {
    const equipos = await db.team.findMany({
      where: orgScopeWhere([ligaB.orgId]),
      select: { organizationId: true },
    });
    expect(equipos).toHaveLength(2);
    expect(equipos.every((e) => e.organizationId === ligaB.orgId)).toBe(true);
  });

  it("`canViewInPanel` coincide con lo que devuelve la query", async () => {
    const alcance = [ligaA.orgId];
    const visibles = await db.tournament.findMany({
      where: orgScopeWhere(alcance),
      select: { organizationId: true },
    });

    expect(canViewInPanel(alcance, ligaA.orgId)).toBe(true);
    expect(canViewInPanel(alcance, ligaB.orgId)).toBe(false);
    // Lo que el helper dice que se ve es exactamente lo que la base devolvió.
    expect(visibles.every((t) => canViewInPanel(alcance, t.organizationId))).toBe(
      true,
    );
  });
});
