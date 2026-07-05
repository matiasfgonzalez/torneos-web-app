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
    environment: "node",
  },
});
