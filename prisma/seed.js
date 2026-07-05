// Seed de planes (N4). Idempotente: upsert por code.
// Precios placeholder — editarlos acá o directo en la BD cuando se definan.
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const PLANS = [
  {
    code: "FREE",
    name: "Gratis",
    priceMonthly: 0,
    maxActiveTournaments: 1,
    maxTeamsPerTournament: 12,
    maxMembers: 2,
    features: { exportPdf: false, customBranding: false, liveMatch: false },
    order: 0,
  },
  {
    code: "PRO",
    name: "Pro",
    priceMonthly: 15000,
    maxActiveTournaments: 999,
    maxTeamsPerTournament: 30,
    maxMembers: 10,
    features: { exportPdf: true, customBranding: false, liveMatch: false },
    order: 1,
  },
  {
    code: "PREMIUM",
    name: "Premium",
    priceMonthly: 25000,
    maxActiveTournaments: 999,
    maxTeamsPerTournament: 999,
    maxMembers: 999,
    features: { exportPdf: true, customBranding: true, liveMatch: true },
    order: 2,
  },
];

for (const plan of PLANS) {
  await db.plan.upsert({
    where: { code: plan.code },
    update: {
      name: plan.name,
      maxActiveTournaments: plan.maxActiveTournaments,
      maxTeamsPerTournament: plan.maxTeamsPerTournament,
      maxMembers: plan.maxMembers,
      features: plan.features,
      order: plan.order,
      // priceMonthly NO se pisa en update: el precio vigente se gestiona en BD
    },
    create: plan,
  });
  console.log(`Plan ${plan.code} listo`);
}

await db.$disconnect();
