import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/lib/generated/prisma/client";

/**
 * Cliente de Prisma de la app (singleton).
 *
 * **B5d — Prisma 7.** Dos cosas cambiaron acá:
 *
 * 1. El cliente **ya no se importa de `@prisma/client`**: el generador
 *    `prisma-client` lo escribe en `lib/generated/prisma` (ignorado en git — es
 *    artefacto, no fuente). Por eso `npm run build` corre `prisma generate`
 *    antes de `next build`: sin ese paso no hay cliente que importar.
 * 2. La conexión va por un **driver adapter** (`@prisma/adapter-pg`), no por la
 *    `url` del schema, que Prisma 7 eliminó. El adapter es quien lee
 *    `DATABASE_URL`; en la app la carga Next, y en la CLI, `prisma.config.ts`.
 */

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

/**
 * El adapter se crea junto con el cliente y se cachea con él: monta un pool de
 * `pg`, así que instanciarlo por request abriría conexiones nuevas contra Neon
 * en cada hot-reload de desarrollo — el motivo de siempre del singleton.
 */
function crearCliente(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "Falta DATABASE_URL: el driver adapter de Prisma la necesita para abrir el pool.",
    );
  }
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

function instancia(): PrismaClient {
  const cacheada = globalThis.prisma ?? crearCliente();
  if (process.env.NODE_ENV !== "production") globalThis.prisma = cacheada;
  return cacheada;
}

/**
 * **Perezoso a propósito.** Con el adapter, construir el cliente exige tener
 * `DATABASE_URL` — y hacerlo en el cuerpo del módulo significaba que
 * *importar* `lib/db` reventara sin base. Eso rompió 4 archivos de tests que no
 * tocan la base y solo lo arrastran por una cadena de imports, pero el problema
 * de fondo es más general: un módulo no debería exigir configuración viva para
 * poder cargarse.
 *
 * El proxy mueve la construcción al **primer uso**: el mensaje claro sigue
 * estando, pero aparece cuando alguien consulta de verdad, no cuando el bundler
 * resuelve un import.
 */
export const db = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const cliente = instancia() as unknown as Record<string | symbol, unknown>;
    const valor = cliente[prop];
    // Los métodos se atan al cliente: `db.$transaction(...)` y
    // `db.match.findMany(...)` necesitan su `this` original.
    return typeof valor === "function" ? valor.bind(cliente) : valor;
  },
});
