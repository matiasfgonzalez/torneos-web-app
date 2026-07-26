import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: [
      { find: "@modules", replacement: path.resolve(__dirname, "modules") },
      { find: "@", replacement: path.resolve(__dirname) },
    ],
  },
  test: {
    include: ["tests/**/*.test.ts"],
    // Los de integración necesitan una Postgres levantada y van por
    // `npm run test:integration` (vitest.integration.config.ts). Excluirlos acá
    // mantiene `npm test` en lo que siempre fue: rápido y sin infra.
    exclude: ["tests/integration/**", "node_modules/**"],
    environment: "node",
  },
});
