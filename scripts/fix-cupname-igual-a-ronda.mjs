/**
 * Limpia el `cupName` de las fases donde se cargó **el nombre de la ronda** en
 * vez del de la copa (S13).
 *
 * `TournamentPhase.cupName` separa los cuadros públicos: dos copas en un mismo
 * torneo (Oro / Plata) son dos brackets distintos. El diálogo de "Nueva ronda
 * de copa" pedía la copa como campo **obligatorio**, así que en un torneo con
 * una sola fase final había que escribir algo — y lo natural fue repetir el
 * nombre de la ronda ("semifinales", "final"). Resultado: cada ronda quedaba
 * como si fuera su propia copa y el cuadro se partía en un cuadro por ronda.
 *
 * El campo ya es opcional en la app; este script barre lo que quedó cargado así.
 *
 * Criterio (conservador): se limpia una fase solo si su `cupName` es **igual**
 * a su `name` (ignorando mayúsculas y espacios). Una copa de verdad —"Copa de
 * Oro" en la ronda "Semifinal"— nunca cumple eso, así que no se toca.
 *
 * Uso:
 *   node scripts/fix-cupname-igual-a-ronda.mjs                 → solo lista (dry-run)
 *   node scripts/fix-cupname-igual-a-ronda.mjs --force         → aplica
 *   node scripts/fix-cupname-igual-a-ronda.mjs --tournament ID → limita a un torneo
 */

import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

// Un script de Node suelto no carga `.env`; lo metemos en process.env para que
// PrismaClient encuentre DATABASE_URL.
if (!process.env.DATABASE_URL) {
  try {
    const env = readFileSync(new URL("../.env", import.meta.url), "utf8");
    for (const line of env.split(/\r?\n/)) {
      const t = line.trim();
      if (t.startsWith("DATABASE_URL=")) {
        process.env.DATABASE_URL = t
          .slice(t.indexOf("=") + 1)
          .trim()
          .replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    /* si no hay .env, que falle abajo con un mensaje claro */
  }
}

const force = process.argv.includes("--force");
const tIdx = process.argv.indexOf("--tournament");
const tournamentId = tIdx !== -1 ? process.argv[tIdx + 1] : undefined;

const prisma = new PrismaClient();

const norm = (s) => (s ?? "").trim().toLowerCase();

try {
  const phases = await prisma.tournamentPhase.findMany({
    where: {
      cupName: { not: null },
      ...(tournamentId ? { tournamentId } : {}),
    },
    select: {
      id: true,
      name: true,
      cupName: true,
      order: true,
      tournamentId: true,
      tournament: { select: { name: true } },
    },
    orderBy: [{ tournamentId: "asc" }, { order: "asc" }],
  });

  const targets = phases.filter((p) => norm(p.cupName) === norm(p.name));

  if (targets.length === 0) {
    console.log("No hay fases con `cupName` igual al nombre de la ronda.");
  } else {
    console.log(
      `${targets.length} fase(s) con la copa cargada como el nombre de la ronda:\n`,
    );
    for (const p of targets) {
      console.log(
        `  · [${p.tournament?.name ?? p.tournamentId}] order=${p.order} "${p.name}" — cupName="${p.cupName}" → null`,
      );
    }

    if (!force) {
      console.log(
        "\nDry-run: no se modificó nada. Volvé a correr con --force para aplicar.",
      );
    } else {
      const { count } = await prisma.tournamentPhase.updateMany({
        where: { id: { in: targets.map((p) => p.id) } },
        data: { cupName: null },
      });
      console.log(`\nListo: ${count} fase(s) actualizadas (cupName = null).`);
    }
  }
} finally {
  await prisma.$disconnect();
}
