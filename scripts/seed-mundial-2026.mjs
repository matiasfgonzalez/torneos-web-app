/**
 * Carga las selecciones del Mundial 2026 (Canadá / México / EE.UU.) como
 * equipos de una liga, para tener material real a mano al probar el sistema.
 *
 *   npm run db:seed:mundial              → los carga en tu primera liga
 *   npm run db:seed:mundial -- --org ID  → en la liga que le digas
 *   npm run db:seed:mundial -- --list    → solo lista, no escribe nada
 *
 * **Idempotente:** `Team` no tiene índice único por nombre, así que se busca
 * por (nombre, organización) antes de crear. Correrlo dos veces no duplica.
 *
 * Los nombres son los del listado oficial que pasó el usuario (por eso "Catar",
 * "Chequia", "República de Corea" y "RI de Irán", y no sus formas coloquiales).
 * Si preferís los nombres comunes, cambiá el `name` acá y volvé a correrlo.
 *
 * El año de fundación se deja vacío a propósito: mezclar fechas de federación
 * que recuerdo con otras que no, sería peor que no ponerlas. Se completa desde
 * el panel si hace falta.
 */

import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

// Paleta del proyecto (`TEAM_COLORS` en components/shared/form/fields.tsx),
// para que los equipos sembrados usen los mismos colores que ofrece el panel.
const ROJO = "#DC2626";
const AZUL = "#2563EB";
const VERDE = "#16A34A";
const AMARILLO = "#CA8A04";
const NEGRO = "#000000";
const BLANCO = "#FFFFFF";
const NARANJA = "#EA580C";

/**
 * `conf` es la confederación por la que clasificó, y sirve para agrupar la
 * salida del script (y para revisar de un vistazo que no falte ninguna).
 */
const SELECCIONES = [
  // --- Anfitriones (clasifican de oficio) ---
  { name: "Canadá", shortName: "CAN", homeCity: "Toronto", conf: "Anfitrión", homeColor: ROJO, awayColor: BLANCO },
  { name: "México", shortName: "MEX", homeCity: "Ciudad de México", conf: "Anfitrión", homeColor: VERDE, awayColor: BLANCO },
  { name: "Estados Unidos", shortName: "USA", homeCity: "Nueva York", conf: "Anfitrión", homeColor: BLANCO, awayColor: AZUL },

  // --- CONMEBOL ---
  { name: "Argentina", shortName: "ARG", homeCity: "Buenos Aires", conf: "CONMEBOL", homeColor: AZUL, awayColor: BLANCO },
  { name: "Brasil", shortName: "BRA", homeCity: "Río de Janeiro", conf: "CONMEBOL", homeColor: AMARILLO, awayColor: AZUL },
  { name: "Uruguay", shortName: "URU", homeCity: "Montevideo", conf: "CONMEBOL", homeColor: AZUL, awayColor: BLANCO },
  { name: "Colombia", shortName: "COL", homeCity: "Bogotá", conf: "CONMEBOL", homeColor: AMARILLO, awayColor: AZUL },
  { name: "Ecuador", shortName: "ECU", homeCity: "Quito", conf: "CONMEBOL", homeColor: AMARILLO, awayColor: AZUL },
  { name: "Paraguay", shortName: "PAR", homeCity: "Asunción", conf: "CONMEBOL", homeColor: ROJO, awayColor: BLANCO },

  // --- UEFA (ganadores de grupo) ---
  { name: "Alemania", shortName: "GER", homeCity: "Berlín", conf: "UEFA", homeColor: BLANCO, awayColor: NEGRO },
  { name: "Inglaterra", shortName: "ENG", homeCity: "Londres", conf: "UEFA", homeColor: BLANCO, awayColor: ROJO },
  { name: "Francia", shortName: "FRA", homeCity: "París", conf: "UEFA", homeColor: AZUL, awayColor: BLANCO },
  { name: "España", shortName: "ESP", homeCity: "Madrid", conf: "UEFA", homeColor: ROJO, awayColor: AZUL },
  { name: "Portugal", shortName: "POR", homeCity: "Lisboa", conf: "UEFA", homeColor: ROJO, awayColor: BLANCO },
  { name: "Países Bajos", shortName: "NED", homeCity: "Ámsterdam", conf: "UEFA", homeColor: NARANJA, awayColor: AZUL },
  { name: "Bélgica", shortName: "BEL", homeCity: "Bruselas", conf: "UEFA", homeColor: ROJO, awayColor: NEGRO },
  { name: "Croacia", shortName: "CRO", homeCity: "Zagreb", conf: "UEFA", homeColor: ROJO, awayColor: AZUL },
  { name: "Suiza", shortName: "SUI", homeCity: "Berna", conf: "UEFA", homeColor: ROJO, awayColor: BLANCO },
  { name: "Austria", shortName: "AUT", homeCity: "Viena", conf: "UEFA", homeColor: ROJO, awayColor: BLANCO },
  { name: "Noruega", shortName: "NOR", homeCity: "Oslo", conf: "UEFA", homeColor: ROJO, awayColor: BLANCO },
  { name: "Escocia", shortName: "SCO", homeCity: "Glasgow", conf: "UEFA", homeColor: AZUL, awayColor: BLANCO },

  // --- CAF ---
  { name: "Marruecos", shortName: "MAR", homeCity: "Rabat", conf: "CAF", homeColor: ROJO, awayColor: VERDE },
  { name: "Senegal", shortName: "SEN", homeCity: "Dakar", conf: "CAF", homeColor: VERDE, awayColor: BLANCO },
  { name: "Egipto", shortName: "EGY", homeCity: "El Cairo", conf: "CAF", homeColor: ROJO, awayColor: BLANCO },
  { name: "Argelia", shortName: "ALG", homeCity: "Argel", conf: "CAF", homeColor: VERDE, awayColor: BLANCO },
  { name: "Túnez", shortName: "TUN", homeCity: "Túnez", conf: "CAF", homeColor: ROJO, awayColor: BLANCO },
  { name: "Ghana", shortName: "GHA", homeCity: "Acra", conf: "CAF", homeColor: BLANCO, awayColor: NEGRO },
  { name: "Costa de Marfil", shortName: "CIV", homeCity: "Abiyán", conf: "CAF", homeColor: NARANJA, awayColor: BLANCO },
  { name: "Sudáfrica", shortName: "RSA", homeCity: "Johannesburgo", conf: "CAF", homeColor: VERDE, awayColor: AMARILLO },
  { name: "Islas de Cabo Verde", shortName: "CPV", homeCity: "Praia", conf: "CAF", homeColor: AZUL, awayColor: BLANCO },

  // --- AFC ---
  { name: "Japón", shortName: "JPN", homeCity: "Tokio", conf: "AFC", homeColor: AZUL, awayColor: BLANCO },
  { name: "República de Corea", shortName: "KOR", homeCity: "Seúl", conf: "AFC", homeColor: ROJO, awayColor: BLANCO },
  { name: "RI de Irán", shortName: "IRN", homeCity: "Teherán", conf: "AFC", homeColor: BLANCO, awayColor: ROJO },
  { name: "Australia", shortName: "AUS", homeCity: "Sídney", conf: "AFC", homeColor: AMARILLO, awayColor: VERDE },
  { name: "Arabia Saudí", shortName: "KSA", homeCity: "Riad", conf: "AFC", homeColor: VERDE, awayColor: BLANCO },
  { name: "Catar", shortName: "QAT", homeCity: "Doha", conf: "AFC", homeColor: ROJO, awayColor: BLANCO },
  { name: "Uzbekistán", shortName: "UZB", homeCity: "Taskent", conf: "AFC", homeColor: BLANCO, awayColor: AZUL },
  { name: "Jordania", shortName: "JOR", homeCity: "Amán", conf: "AFC", homeColor: ROJO, awayColor: BLANCO },

  // --- CONCACAF (además de los tres anfitriones) ---
  { name: "Panamá", shortName: "PAN", homeCity: "Ciudad de Panamá", conf: "CONCACAF", homeColor: ROJO, awayColor: BLANCO },
  { name: "Haití", shortName: "HAI", homeCity: "Puerto Príncipe", conf: "CONCACAF", homeColor: AZUL, awayColor: ROJO },
  { name: "Curazao", shortName: "CUW", homeCity: "Willemstad", conf: "CONCACAF", homeColor: AZUL, awayColor: BLANCO },

  // --- OFC ---
  { name: "Nueva Zelanda", shortName: "NZL", homeCity: "Auckland", conf: "OFC", homeColor: BLANCO, awayColor: NEGRO },

  // --- UEFA (repechaje de marzo 2026) ---
  { name: "Bosnia y Herzegovina", shortName: "BIH", homeCity: "Sarajevo", conf: "UEFA", homeColor: AZUL, awayColor: BLANCO },
  { name: "Chequia", shortName: "CZE", homeCity: "Praga", conf: "UEFA", homeColor: ROJO, awayColor: BLANCO },
  { name: "Suecia", shortName: "SWE", homeCity: "Estocolmo", conf: "UEFA", homeColor: AMARILLO, awayColor: AZUL },
  { name: "Turquía", shortName: "TUR", homeCity: "Estambul", conf: "UEFA", homeColor: ROJO, awayColor: BLANCO },

  // --- Repechaje intercontinental ---
  { name: "Irak", shortName: "IRQ", homeCity: "Bagdad", conf: "AFC", homeColor: BLANCO, awayColor: VERDE },
  { name: "RD Congo", shortName: "COD", homeCity: "Kinsasa", conf: "CAF", homeColor: AZUL, awayColor: ROJO },
];


function getDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  try {
    const env = readFileSync(new URL("../.env", import.meta.url), "utf8");
    const line = env.split(/\r?\n/).find((l) => l.trim().startsWith("DATABASE_URL="));
    return line ? line.slice(line.indexOf("=") + 1).trim().replace(/^["']|["']$/g, "") : null;
  } catch {
    return null;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const soloListar = args.includes("--list");
  const orgFlag = args.indexOf("--org");
  const orgId = orgFlag !== -1 ? args[orgFlag + 1] : null;

  if (soloListar) {
    const porConf = new Map();
    for (const s of SELECCIONES) {
      porConf.set(s.conf, [...(porConf.get(s.conf) ?? []), s.name]);
    }
    console.log(`\n${SELECCIONES.length} selecciones en la lista:\n`);
    for (const [conf, nombres] of porConf) {
      console.log(`  ${conf} (${nombres.length}): ${nombres.join(", ")}`);
    }
    console.log(`\n  Total: ${SELECCIONES.length} de 48.\n`);
    return;
  }

  const db = new PrismaClient();
  try {
    const org = orgId
      ? await db.organization.findUnique({ where: { id: orgId }, select: { id: true, name: true } })
      : await db.organization.findFirst({
          select: { id: true, name: true },
          orderBy: { createdAt: "asc" },
        });

    if (!org) {
      console.error(
        orgId
          ? `\n✖ No existe una liga con el id ${orgId}.\n`
          : "\n✖ No hay ninguna liga creada todavía. Creá una desde /crear-liga y volvé a correr esto.\n",
      );
      process.exit(1);
    }

    const url = getDatabaseUrl();
    const host = url ? new URL(url).host : "(desconocido)";
    console.log(`\n  Base: ${host}`);
    console.log(`  Liga: ${org.name}\n`);

    let creados = 0;
    let existentes = 0;

    for (const s of SELECCIONES) {
      // `Team` no tiene índice único por nombre: se comprueba antes de crear.
      const yaEsta = await db.team.findFirst({
        where: { name: s.name, organizationId: org.id, deletedAt: null },
        select: { id: true },
      });

      if (yaEsta) {
        existentes += 1;
        continue;
      }

      await db.team.create({
        data: {
          organizationId: org.id,
          name: s.name,
          shortName: s.shortName,
          homeCity: s.homeCity,
          homeColor: s.homeColor,
          awayColor: s.awayColor,
          description: `Selección nacional — ${s.conf}`,
          enabled: true,
        },
      });
      creados += 1;
    }

    console.log(`  ✓ ${creados} equipos creados`);
    if (existentes > 0) {
      console.log(`  · ${existentes} ya existían y se dejaron como estaban`);
    }
    console.log(
      `\n  Están las ${SELECCIONES.length} selecciones del Mundial 2026.\n`,
    );
  } finally {
    await db.$disconnect();
  }
}

main().catch((error) => {
  console.error("\n✖ Falló el seed:", error.message ?? error, "\n");
  process.exit(1);
});
