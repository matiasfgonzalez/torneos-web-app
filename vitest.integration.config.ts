import { defineConfig } from "vitest/config";
import path from "node:path";

/**
 * Tests de integración (#26): los que necesitan una Postgres de verdad.
 *
 * Van en una config aparte a propósito. `npm test` tiene que seguir siendo la
 * suite rápida y sin infra —314 tests en ~3s— y obligar a levantar Docker para
 * correr los tests de lógica sería cambiar un problema por otro.
 *
 *   docker compose -f docker-compose.test.yml up -d
 *   npm run test:integration
 */
export default defineConfig({
  resolve: {
    alias: [
      { find: "@modules", replacement: path.resolve(__dirname, "modules") },
      { find: "@", replacement: path.resolve(__dirname) },
    ],
  },
  test: {
    include: ["tests/integration/**/*.test.ts"],
    environment: "node",
    // Apunta `DATABASE_URL` a la base descartable antes de que nadie importe
    // `lib/db` (ver el comentario de env-setup.ts: es una guarda, no un detalle).
    setupFiles: ["tests/integration/env-setup.ts"],
    // Comparten una sola base: en paralelo se truncarían las tablas entre sí.
    fileParallelism: false,
    // Aplicar 23 migraciones en frío no entra en el timeout por defecto.
    testTimeout: 60_000,
    hookTimeout: 180_000,
  },
});
