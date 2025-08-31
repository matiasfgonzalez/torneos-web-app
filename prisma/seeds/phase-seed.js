// prisma/seeds/phase-seed.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const phases = [
    { name: "FECHA", order: 1 },
    { name: "CRUCES", order: 2 },
    { name: "FASES_DE_GRUPOS", order: 3 },
    { name: "DIECISAVOS_DE_FINAL", order: 4 },
    { name: "OCTAVOS_DE_FINAL", order: 5 },
    { name: "CUARTOS_DE_FINAL", order: 6 },
    { name: "SEMIFINAL", order: 7 },
    { name: "FINAL", order: 8 },
  ];

  for (const phase of phases) {
    await prisma.phase.upsert({
      where: { name: phase.name },
      update: {},
      create: phase,
    });
  }

  console.log("Phases seeded!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
