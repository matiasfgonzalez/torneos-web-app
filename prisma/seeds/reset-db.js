import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("⚠️  Starting database reset... THIS WILL DELETE ALL DATA.");

  // Transaction to ensure atomicity is not strictly necessary for a reset script,
  // but sequential execution is critical for FK constraints.

  try {
    console.log("Deleting Goals...");
    await prisma.goal.deleteMany({});

    console.log("Deleting Cards...");
    await prisma.card.deleteMany({});

    console.log("Deleting MatchReferees...");
    await prisma.matchReferee.deleteMany({});

    console.log("Deleting Matches...");
    await prisma.match.deleteMany({});

    console.log("Deleting TeamPhaseStats...");
    await prisma.teamPhaseStats.deleteMany({});

    console.log("Deleting TeamPlayers...");
    await prisma.teamPlayer.deleteMany({});

    console.log("Deleting TournamentTeams...");
    await prisma.tournamentTeam.deleteMany({});

    console.log("Deleting TournamentPhases...");
    await prisma.tournamentPhase.deleteMany({});

    console.log("Deleting Tournaments...");
    await prisma.tournament.deleteMany({});

    console.log("Deleting Teams...");
    // Teams can be created by users, but have no strict dependency on them for deletion unless constraints say so.
    await prisma.team.deleteMany({});

    console.log("Deleting Players...");
    await prisma.player.deleteMany({});

    console.log("Deleting Referees...");
    await prisma.referee.deleteMany({});

    console.log("Deleting News...");
    await prisma.news.deleteMany({});

    console.log("Deleting AuditLogs...");
    await prisma.auditLog.deleteMany({});

    console.log("Deleting Users...");
    await prisma.user.deleteMany({});

    console.log("Deleting Legacy Phases...");
    await prisma.phase.deleteMany({});

    console.log("✅ Database cleared successfully.");

    // Re-seed Phases
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

    for (const phase of phases) {
      await prisma.phase.create({
        data: phase,
      });
    }

    console.log("✅ Database reset and seeded complete!");

  } catch (error) {
    console.error("❌ Error during database reset:", error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
