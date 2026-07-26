import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { PrismaClient } from "@/lib/generated/prisma/client";

import {
  aplicarMigraciones,
  clienteDeTests,
  hayBaseDeTests,
} from "./setup";

/**
 * Las 23 migraciones aplican sobre una base **vacía**.
 *
 * En la base real se aplican de a una, a medida que se escriben: nadie vuelve a
 * correr el historial completo. Una migración que dependa de un estado que solo
 * existía en esa base concreta —una tabla que se creó a mano, un enum que ya
 * tenía un valor— pasa desapercibida hasta que alguien levanta un entorno nuevo
 * (o hasta el primer deploy a otro ambiente). Esto lo ejercita en cada corrida.
 */
describe.skipIf(!(await hayBaseDeTests()))("migraciones", () => {
  let db: PrismaClient;

  beforeAll(() => {
    aplicarMigraciones();
    db = clienteDeTests();
  });

  afterAll(async () => {
    await db?.$disconnect();
  });

  it("aplica el historial completo sobre una base vacía", async () => {
    const filas = await db.$queryRawUnsafe<{ count: bigint }[]>(
      `SELECT count(*)::bigint AS count FROM "_prisma_migrations" WHERE finished_at IS NOT NULL`,
    );
    // Si alguna hubiera fallado, `migrate deploy` habría tirado en el beforeAll.
    expect(Number(filas[0].count)).toBeGreaterThanOrEqual(23);
  });

  it("no deja migraciones a medio aplicar", async () => {
    const rotas = await db.$queryRawUnsafe<{ migration_name: string }[]>(
      `SELECT migration_name FROM "_prisma_migrations"
        WHERE finished_at IS NULL OR rolled_back_at IS NOT NULL`,
    );
    expect(rotas).toEqual([]);
  });

  it("el schema que quedó es el que describe schema.prisma", async () => {
    // Lo que se afirma acá es que la query **no explota**, no que la tabla esté
    // vacía: son columnas que agregaron migraciones tardías, y si `migrate
    // deploy` hubiera quedado corto Prisma tiraría `column does not exist`.
    // (`cupName` llegó con `copas_y_fase_final`, S13.)
    await expect(
      db.tournamentPhase.findMany({ select: { cupName: true }, take: 1 }),
    ).resolves.toBeInstanceOf(Array);

    // `publishedAt` nullable es de A6: en el schema viejo era NOT NULL, así que
    // filtrar por `null` sobre el schema viejo no tendría sentido.
    await expect(
      db.news.findMany({ where: { publishedAt: null }, take: 1 }),
    ).resolves.toBeInstanceOf(Array);
  });

  it("`TournamentFormat` quedó con los 3 valores de M13", async () => {
    // El enum se redujo de 14 a 3 con un CREATE TYPE + swap. Si ese paso no
    // hubiera aplicado bien, acá aparecerían los valores viejos.
    const valores = await db.$queryRawUnsafe<{ enumlabel: string }[]>(
      `SELECT e.enumlabel FROM pg_enum e
         JOIN pg_type t ON t.oid = e.enumtypid
        WHERE t.typname = 'TournamentFormat'
        ORDER BY e.enumsortorder`,
    );
    expect(valores.map((v) => v.enumlabel)).toEqual([
      "LIGA",
      "ELIMINACION_DIRECTA",
      "GRUPOS",
    ]);
  });
});
