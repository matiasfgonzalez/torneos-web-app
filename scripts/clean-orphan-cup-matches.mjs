/**
 * Limpia los partidos de copa que quedaron **huérfanos** por el bug de
 * `deleteCupPhase` (antes borraba la fase pero no sus partidos, porque la
 * relación `Match → TournamentPhase` es `SetNull`). Esos partidos quedaron
 * "programado", sin fase y sin resultado.
 *
 * El bug ya está corregido en la app; este script es solo para barrer lo que
 * quedó dado vuelta en una base concreta.
 *
 * Un partido se considera huérfano de copa si, a la vez:
 *   - no tiene fase (`tournamentPhaseId: null`),
 *   - es de ronda de copa (`roundNumber: 1`) — los de fase regular tienen
 *     `roundNumber` nulo en esta base, así que no los toca,
 *   - no tiene resultado cargado (homeScore/awayScore en null),
 *   - sigue "programado".
 *
 * Uso:
 *   node scripts/clean-orphan-cup-matches.mjs                 → solo lista (dry-run)
 *   node scripts/clean-orphan-cup-matches.mjs --force         → borra
 *   node scripts/clean-orphan-cup-matches.mjs --tournament ID → limita a un torneo
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

const where = {
  tournamentPhaseId: null,
  roundNumber: 1,
  homeScore: null,
  awayScore: null,
  status: "PROGRAMADO",
  ...(tournamentId ? { tournamentId } : {}),
};

try {
  const orphans = await prisma.match.findMany({
    where,
    select: {
      id: true,
      tournamentId: true,
      dateTime: true,
      homeTeam: { select: { team: { select: { name: true } } } },
      awayTeam: { select: { team: { select: { name: true } } } },
    },
    orderBy: { dateTime: "asc" },
  });

  if (orphans.length === 0) {
    console.log("No hay partidos de copa huérfanos. Nada que borrar.");
    process.exit(0);
  }

  console.log(`Partidos de copa huérfanos encontrados: ${orphans.length}\n`);
  for (const m of orphans) {
    const home = m.homeTeam?.team?.name ?? "?";
    const away = m.awayTeam?.team?.name ?? "?";
    console.log(`  · ${home} vs ${away}  (torneo ${m.tournamentId})`);
  }

  if (!force) {
    console.log(
      "\n(dry-run) No se borró nada. Volvé a correr con --force para eliminarlos.",
    );
    process.exit(0);
  }

  const { count } = await prisma.match.deleteMany({ where });
  console.log(`\n✅ Eliminados ${count} partidos huérfanos.`);
} catch (err) {
  console.error("Error:", err.message);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
