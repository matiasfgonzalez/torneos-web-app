import { execFileSync } from "node:child_process";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

/**
 * Arranque de los tests de integración (#26).
 *
 * Los 314 tests del repo son de lógica pura y no tocan la base: eso deja pasar
 * en verde justo lo que no se puede razonar en memoria —un `where` que filtra de
 * más, un `select` mal armado, una migración que no aplica, un cambio de motor
 * de Prisma—. Estos tests cubren solo esos casos.
 *
 * **Cómo se corren:**
 *   docker compose -f docker-compose.test.yml up -d
 *   npm run test:integration
 *
 * **Si no hay base, no fallan: se saltean.** `npm test` sigue siendo la suite
 * rápida sin infra; obligar a tener Docker para correr los tests de lógica sería
 * cambiar un problema por otro.
 */

/** URL de la Postgres descartable. Coincide con `docker-compose.test.yml`. */
export const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  "postgresql://golazo:golazo@localhost:55432/golazo_test";

let disponible: boolean | null = null;

/** ¿Hay una base de tests a la que conectarse? Se chequea una sola vez. */
export async function hayBaseDeTests(): Promise<boolean> {
  if (disponible !== null) return disponible;

  const sonda = clienteDeTests();
  try {
    await sonda.$queryRawUnsafe("SELECT 1");
    disponible = true;
  } catch {
    disponible = false;
  } finally {
    await sonda.$disconnect();
  }
  return disponible;
}

/**
 * Aplica **todas** las migraciones sobre la base de tests.
 *
 * Es a la vez preparación y aserción: si una migración no aplica sobre una base
 * vacía, esto explota y ningún test corre. Es el único lugar del repo donde el
 * historial de migraciones se ejercita de punta a punta — en la base real solo
 * se aplican de a una, y una migración rota se descubre en el deploy.
 */
export function aplicarMigraciones(): void {
  // Se invoca el entrypoint de la CLI con el mismo `node` que corre los tests,
  // en vez de `npx`: en Windows, spawnear `npx.cmd` sin shell tira
  // `EINVAL` desde el arreglo de seguridad de Node 20.12, y con shell habría
  // que preocuparse por el quoting. Esto es directo y no depende del SO.
  execFileSync(
    process.execPath,
    [require.resolve("prisma/build/index.js"), "migrate", "deploy"],
    {
      env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
      stdio: "pipe",
      // El schema es grande y son 23 migraciones: en frío tarda.
      timeout: 180_000,
    },
  );
}

/**
 * Cliente apuntado a la base de tests (nunca a la de la app).
 *
 * En Prisma 7 la conexión va por **driver adapter**: `datasources` desapareció
 * de las opciones del cliente y la `url` ya no vive en el schema. Pasarle el
 * adapter explícito acá es, además, la garantía de que estos tests no pueden
 * terminar hablando con la base de la app aunque `DATABASE_URL` esté mal.
 */
export function clienteDeTests(): PrismaClient {
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: TEST_DATABASE_URL }),
  });
}

/**
 * Vacía las tablas de dominio entre tests.
 *
 * `TRUNCATE ... CASCADE` sobre todo lo público salvo `_prisma_migrations`: la
 * lista sale de `pg_tables`, no escrita a mano — una lista a mano se
 * desactualiza en cuanto se agrega un modelo y deja datos colgados que hacen
 * fallar el test siguiente por el motivo equivocado.
 */
export async function limpiarBase(db: PrismaClient): Promise<void> {
  const tablas = await db.$queryRawUnsafe<{ tablename: string }[]>(
    `SELECT tablename FROM pg_tables
      WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'`,
  );
  if (tablas.length === 0) return;
  const lista = tablas.map((t) => `"public"."${t.tablename}"`).join(", ");
  await db.$executeRawUnsafe(`TRUNCATE TABLE ${lista} CASCADE`);
}
