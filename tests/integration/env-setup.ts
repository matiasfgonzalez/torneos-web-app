import { TEST_DATABASE_URL } from "./setup";

/**
 * Se ejecuta **antes** de que cualquier test importe `lib/db` (vitest
 * `setupFiles`). Importa porque `lib/db` construye el `PrismaClient` leyendo
 * `DATABASE_URL` en el momento del import: si se apuntara después, ya sería
 * tarde y el cliente estaría hablando con la base equivocada.
 *
 * Y "la base equivocada" acá es la de producción. `recalculateTournamentStandings`
 * no recibe un cliente por parámetro —usa el singleton— así que un
 * `DATABASE_URL` mal puesto significaría **resetear y recalcular las tablas de
 * posiciones de la liga real**. De ahí la guarda de abajo: misma idea que
 * `scripts/reset-db.mjs`, que exige confirmar el nombre de la base antes de
 * borrar nada.
 */

/**
 * La base de tests tiene que ser **descartable**. La regla es explícita y no
 * "inteligente": local (`localhost`/`127.0.0.1`) se acepta sin más; cualquier
 * host remoto —un branch de Neon, por ejemplo— exige activarlo a mano con
 * `TEST_DATABASE_ALLOW_REMOTE=1`.
 *
 * Una versión anterior de esta guarda comparaba `TEST_DATABASE_URL` contra la
 * `DATABASE_URL` de la app dentro de una rama que ya había descartado ese caso:
 * era código muerto y **nunca protegía de nada**. Esta regla sí corta el
 * escenario real —alguien exporta la URL de producción como `TEST_DATABASE_URL`
 * y los tests truncan la base de la liga—, y lo hace antes de abrir conexión.
 */
const esLocal = /@(localhost|127\.0\.0\.1)[:/]/.test(TEST_DATABASE_URL);

if (!esLocal && process.env.TEST_DATABASE_ALLOW_REMOTE !== "1") {
  throw new Error(
    `La base de tests apunta a un host remoto (${TEST_DATABASE_URL.replace(/:[^:@]*@/, ":***@")}).\n` +
      "Los tests de integración TRUNCAN todas las tablas. Si es a propósito y la " +
      "base es descartable, volvé a correr con TEST_DATABASE_ALLOW_REMOTE=1.",
  );
}

process.env.DATABASE_URL = TEST_DATABASE_URL;
