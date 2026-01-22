// prisma/seeds/phase-seed.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Limpiar primero para evitar conflictos
  console.log("Deleting Users...");
  await prisma.user.deleteMany({});
  console.log("Deleting Legacy Phases...");
  await prisma.phase.deleteMany({});
  console.log("✅ Database cleared successfully.");

  console.log("🌱 Seeding initial Phases...");
  
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

  // Usar createMany en lugar de upsert
  await prisma.phase.createMany({
    data: phases,
    skipDuplicates: true,
  });

  console.log("✅ Database reset and seeded complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
