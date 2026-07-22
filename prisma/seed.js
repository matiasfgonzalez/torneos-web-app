// Seed de planes (N4). Idempotente: upsert por code.
// Las definiciones viven en `plans.mjs` para que un test pueda verificarlas sin
// escribir en la base (ver tests/plans/features.test.ts).
import { PrismaClient } from "@prisma/client";
import { PLANS } from "./plans.mjs";

const db = new PrismaClient();

for (const plan of PLANS) {
  const existente = await db.plan.findUnique({
    where: { code: plan.code },
    select: { features: true },
  });

  // Las features se **fusionan**, no se pisan: si el admin prendió algo desde
  // /admin/planes, resembrar no se lo apaga. Lo que sí hace el seed es
  // completar las claves que falten —el caso de `orgNews`, que no existía en
  // los planes ya guardados y por eso quedaba en `false` para todos—.
  const features = { ...plan.features, ...(existente?.features ?? {}) };
  const faltaban = Object.keys(plan.features).filter(
    (k) => existente && !(k in existente.features),
  );

  await db.plan.upsert({
    where: { code: plan.code },
    update: {
      name: plan.name,
      maxActiveTournaments: plan.maxActiveTournaments,
      maxTeamsPerTournament: plan.maxTeamsPerTournament,
      maxMembers: plan.maxMembers,
      features,
      order: plan.order,
      // priceMonthly NO se pisa en update: el precio vigente se gestiona en BD
    },
    create: plan,
  });

  const detalle = faltaban.length
    ? ` (se agregaron features faltantes: ${faltaban.join(", ")})`
    : "";
  console.log(`Plan ${plan.code} listo${detalle}`);
}

await db.$disconnect();
