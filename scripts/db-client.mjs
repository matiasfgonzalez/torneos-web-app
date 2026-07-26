import { readFileSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client.ts";

/**
 * Cliente de Prisma para los scripts sueltos (`prisma/seed.js`, `scripts/*.mjs`).
 *
 * **Por qué existe (B5d).** Con Prisma 7 estos scripts dejaron de andar por dos
 * motivos a la vez, y los dos se resuelven acá una sola vez:
 *
 * 1. El cliente ya no está en `node_modules` sino generado como **TypeScript**
 *    en `lib/generated/prisma`. `node` a secas no puede importarlo (su type
 *    stripping no resuelve los imports sin extensión que emite el generador),
 *    así que los scripts corren con **tsx** — de ahí el cambio en los `npm
 *    scripts` y en `migrations.seed` de `prisma.config.ts`.
 * 2. `new PrismaClient()` sin más ya no alcanza: la conexión va por **driver
 *    adapter**, porque la `url` salió del schema.
 *
 * Cada script cargaba además el `.env` a mano con su propio bloque copiado;
 * eso también vive acá ahora.
 */

/** Carga `DATABASE_URL` del `.env` si no vino ya en el entorno. */
function cargarEnv() {
  if (process.env.DATABASE_URL) return;
  try {
    const env = readFileSync(new URL("../.env", import.meta.url), "utf8");
    for (const linea of env.split(/\r?\n/)) {
      const t = linea.trim();
      if (t.startsWith("DATABASE_URL=")) {
        process.env.DATABASE_URL = t
          .slice(t.indexOf("=") + 1)
          .trim()
          .replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    // Sin `.env`: se usan las variables del entorno tal como estén.
  }
}

/** Cliente listo para usar. Falla con un mensaje claro si falta la URL. */
export function crearDbDeScript() {
  cargarEnv();
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "Falta DATABASE_URL (ni en el entorno ni en .env): el driver adapter no puede abrir el pool.",
    );
  }
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}
