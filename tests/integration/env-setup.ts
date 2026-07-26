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

const original = process.env.DATABASE_URL;

if (original && original === TEST_DATABASE_URL) {
  // Ya apunta a la base de tests: nada que hacer.
} else if (original && !/localhost|127\.0\.0\.1/.test(TEST_DATABASE_URL)) {
  // `TEST_DATABASE_URL` remota (un branch de Neon, por ejemplo): se acepta,
  // pero tiene que ser distinta de la de la app.
  if (original === TEST_DATABASE_URL) {
    throw new Error(
      "TEST_DATABASE_URL es la misma base que DATABASE_URL: los tests de " +
        "integración truncan tablas, apuntá a una base descartable.",
    );
  }
}

process.env.DATABASE_URL = TEST_DATABASE_URL;

if (process.env.DATABASE_URL !== TEST_DATABASE_URL) {
  throw new Error("No se pudo apuntar DATABASE_URL a la base de tests.");
}
