// Backfill de slugs de torneos existentes (N9). Idempotente: solo toca los
// que aún no tienen slug. Genera slug único por organización con desambiguación.
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

function slugify(input) {
  return (
    input
      .toLowerCase()
      .normalize("NFD")
      .replaceAll(/[̀-ͯ]/g, "")
      .replaceAll(/[^a-z0-9]+/g, "-")
      .replaceAll(/(^-|-$)/g, "")
      .slice(0, 60) || "torneo"
  );
}

const tournaments = await db.tournament.findMany({
  where: { slug: null },
  select: { id: true, name: true, organizationId: true },
  orderBy: { createdAt: "asc" },
});

// Slugs ya usados por organización (para no colisionar)
const usedByOrg = new Map();
const existing = await db.tournament.findMany({
  where: { slug: { not: null } },
  select: { slug: true, organizationId: true },
});
for (const t of existing) {
  const set = usedByOrg.get(t.organizationId) ?? new Set();
  set.add(t.slug);
  usedByOrg.set(t.organizationId, set);
}

let count = 0;
for (const t of tournaments) {
  const base = slugify(t.name);
  const used = usedByOrg.get(t.organizationId) ?? new Set();
  let slug = base;
  for (let i = 2; used.has(slug); i++) slug = `${base}-${i}`;
  used.add(slug);
  usedByOrg.set(t.organizationId, used);

  await db.tournament.update({ where: { id: t.id }, data: { slug } });
  count++;
  console.log(`  ${t.name} -> ${slug}`);
}

console.log(`Backfill completo: ${count} torneo(s) actualizados.`);
await db.$disconnect();
