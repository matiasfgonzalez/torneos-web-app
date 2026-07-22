/**
 * Vacía la base de datos y la deja lista para arrancar de cero (`npm run db:reset`).
 *
 * Borra TODAS las filas de TODAS las tablas de la app y vuelve a sembrar el
 * catálogo de planes (que no es dato de usuario: sin planes, el alta de una liga
 * no funciona). El esquema y las migraciones NO se tocan — no hace falta
 * re-migrar después.
 *
 * ⚠️ Es destructivo e irreversible. El riesgo real no es borrar: es borrar la
 * base equivocada. `DATABASE_URL` puede apuntar a una base en la nube compartida
 * con el deploy, así que el script:
 *   1. Se niega a correr con NODE_ENV=production.
 *   2. Muestra host y nombre de la base, y qué hay adentro, ANTES de tocar nada.
 *   3. Exige que escribas el nombre de la base para confirmar (no un "sí": si no
 *      leíste cuál es, no la podés escribir).
 *
 * Uso:
 *   npm run db:reset            → interactivo, con confirmación
 *   npm run db:reset -- --force → sin preguntar (para scripts; sigue bloqueado en producción)
 */

import { createInterface } from "node:readline/promises";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

/** Tablas que NO se tocan: el historial de migraciones de Prisma. */
const KEEP_TABLES = new Set(["_prisma_migrations"]);

/**
 * `DATABASE_URL` desde el entorno o, si no está, leída de `.env`. Un script de
 * Node suelto no carga `.env` (Next y Prisma sí lo hacen por su cuenta), y acá
 * hace falta para poder MOSTRAR a qué base apunta.
 */
function getDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  try {
    const env = readFileSync(new URL("../.env", import.meta.url), "utf8");
    const line = env
      .split(/\r?\n/)
      .find((l) => l.trim().startsWith("DATABASE_URL="));
    if (!line) return null;
    return line.slice(line.indexOf("=") + 1).trim().replace(/^["']|["']$/g, "");
  } catch {
    return null;
  }
}

/** Host y nombre de la base, sin credenciales (esto se imprime en pantalla). */
function describeTarget(url) {
  try {
    const u = new URL(url);
    return { host: u.host, name: u.pathname.replace(/^\//, "") || "(sin nombre)" };
  } catch {
    return { host: "(URL ilegible)", name: "(desconocida)" };
  }
}

async function main() {
  const force = process.argv.includes("--force");

  if (process.env.NODE_ENV === "production") {
    console.error(
      "\n✖ Bloqueado: NODE_ENV=production. Este script no corre contra producción.\n",
    );
    process.exit(1);
  }

  const url = getDatabaseUrl();
  if (!url) {
    console.error(
      "\n✖ No se encontró DATABASE_URL (ni en el entorno ni en .env).\n",
    );
    process.exit(1);
  }

  const target = describeTarget(url);
  const db = new PrismaClient();

  try {
    // Tablas reales de la base, no una lista escrita a mano: un modelo nuevo en
    // el schema quedaría fuera de una lista fija y sobrevivirían filas viejas
    // sin que nadie lo note.
    const rows = await db.$queryRaw`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    `;
    const tables = rows
      .map((r) => r.tablename)
      .filter((t) => !KEEP_TABLES.has(t))
      .sort();

    if (tables.length === 0) {
      console.log("\nLa base no tiene tablas de la app. Nada que borrar.\n");
      return;
    }

    // Conteo previo: sirve para confirmar que se apunta a la base correcta
    // (una base vacía y una con datos reales se distinguen de un vistazo).
    const counts = [];
    let total = 0;
    for (const t of tables) {
      const [{ count }] = await db.$queryRawUnsafe(
        `SELECT COUNT(*)::int AS count FROM "${t}"`,
      );
      if (count > 0) counts.push({ tabla: t, filas: count });
      total += count;
    }

    console.log("\n────────────────────────────────────────────────");
    console.log("  RESET DE BASE DE DATOS");
    console.log("────────────────────────────────────────────────");
    console.log(`  Host:  ${target.host}`);
    console.log(`  Base:  ${target.name}`);
    console.log(`  Tablas: ${tables.length} · Filas a borrar: ${total}`);
    console.log("────────────────────────────────────────────────\n");

    if (counts.length > 0) {
      console.table(counts);
    } else {
      console.log("  (la base ya está vacía)\n");
    }

    if (total === 0 && !force) {
      console.log("No hay datos que borrar. Se resiembran los planes igual.\n");
    } else if (!force) {
      console.log(
        "⚠️  Esto borra TODOS los datos y no se puede deshacer.\n" +
          "   Si esta base la comparte el deploy, se borra también para el sitio publicado.\n",
      );
      const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      const answer = await rl.question(
        `Escribí el nombre de la base para confirmar (${target.name}): `,
      );
      rl.close();

      if (answer.trim() !== target.name) {
        console.error("\n✖ Cancelado: el nombre no coincide.\n");
        process.exit(1);
      }
    }

    // Un solo TRUNCATE con todas las tablas: CASCADE resuelve las FK sin tener
    // que ordenar los borrados a mano, y RESTART IDENTITY reinicia las
    // secuencias para que los autoincrementales empiecen de nuevo en 1.
    const list = tables.map((t) => `"${t}"`).join(", ");
    await db.$executeRawUnsafe(
      `TRUNCATE TABLE ${list} RESTART IDENTITY CASCADE`,
    );
    console.log(`\n✓ ${tables.length} tablas vaciadas (${total} filas).`);
  } finally {
    await db.$disconnect();
  }

  // Los planes son catálogo, no dato de usuario: sin ellos no se puede crear una
  // liga. Se reusa el seed que ya existe (idempotente) en vez de duplicarlo acá.
  console.log("\nResembrando el catálogo de planes…");
  execFileSync("node", ["prisma/seed.js"], { stdio: "inherit" });

  console.log(
    "\n✓ Base lista para arrancar de cero." +
      "\n  Al volver a entrar, tu usuario se recrea solo desde Clerk," +
      "\n  y el email de ADMIN_EMAIL recupera el rol ADMINISTRADOR.\n",
  );
}

main().catch((error) => {
  console.error("\n✖ Falló el reset:", error.message ?? error, "\n");
  process.exit(1);
});
