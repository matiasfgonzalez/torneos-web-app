import path from "node:path";

import { defineConfig } from "prisma/config";

/**
 * Configuración del CLI de Prisma (B5b).
 *
 * Reemplaza a la clave `prisma` de `package.json`, que está **deprecada y se
 * elimina en Prisma 7**: mientras existía, cada comando arrancaba con un warning
 * y el upgrade mayor quedaba bloqueado.
 *
 * Es config **de la CLI**, no de la app: `generate`, `migrate`, `db seed` y
 * `studio` la leen. El cliente en runtime no pasa por acá — toma `DATABASE_URL`
 * de `process.env`, que en la app lo carga Next.
 */

/**
 * ⚠️ **Con un archivo de config, Prisma deja de cargar `.env` solo.** Lo dice al
 * arrancar: "Prisma config detected, skipping environment variable loading". Sin
 * estas dos líneas, `prisma validate` muere con `P1012: Environment variable not
 * found: DATABASE_URL` — es el paso que convierte esta migración en algo más que
 * mover una clave de lugar.
 *
 * Se usa `process.loadEnvFile` (nativo desde Node 20.12) en vez de sumar
 * `dotenv`: hoy `dotenv` solo está como dependencia **transitiva** de Prisma, así
 * que importarlo sería depender de algo que nadie declaró.
 *
 * El `try` no es defensivo porque sí: en CI o en el deploy no hay `.env` y las
 * variables vienen del entorno. Ahí `loadEnvFile` tira y hay que seguir igual.
 */
try {
  process.loadEnvFile(path.join(process.cwd(), ".env"));
} catch {
  // Sin `.env` local: se usan las variables del entorno tal como estén.
}

export default defineConfig({
  // Explícito aunque coincida con la convención: cuando el schema se parta en
  // varios archivos (`prisma/schema/`), este es el único lugar a tocar.
  schema: path.join("prisma", "schema.prisma"),

  /**
   * B5d — Prisma 7: la URL de conexión **ya no va en el schema**. El bloque
   * `datasource` de `schema.prisma` perdió la propiedad `url`; ahora la CLI la
   * lee de acá (para `migrate`/`db`/`studio`) y el cliente en runtime la recibe
   * por su driver adapter (ver `lib/db.ts`). Es lo que separa "con qué base
   * habla la herramienta" de "con qué base habla la app".
   */
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },

  migrations: {
    // Lo que antes era `package.json#prisma.seed`. Corre con **tsx** desde B5d:
    // el cliente de Prisma 7 se genera como TypeScript en `lib/generated`, y
    // `node` a secas no resuelve los imports sin extensión que emite.
    seed: "tsx prisma/seed.js",
  },
});
