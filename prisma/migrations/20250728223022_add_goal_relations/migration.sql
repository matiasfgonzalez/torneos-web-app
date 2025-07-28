-- CreateEnum
CREATE TYPE "TournamentFormat" AS ENUM ('LIGA', 'COPA');

-- CreateEnum
CREATE TYPE "PhaseName" AS ENUM ('DIECISAVOS_DE_FINAL', 'OCTAVOS_DE_FINAL', 'CUARTOS_DE_FINAL', 'SEMIFINAL', 'FINAL');

-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "penaltyScoreAway" INTEGER,
ADD COLUMN     "penaltyScoreHome" INTEGER,
ADD COLUMN     "penaltyWinnerTeamId" TEXT,
ADD COLUMN     "phaseId" TEXT;

-- AlterTable
ALTER TABLE "Tournament" ADD COLUMN     "format" "TournamentFormat" NOT NULL DEFAULT 'LIGA',
ADD COLUMN     "homeAndAway" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Standing" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "matchesPlayed" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "draws" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "goalsFor" INTEGER NOT NULL DEFAULT 0,
    "goalsAgainst" INTEGER NOT NULL DEFAULT 0,
    "goalDifference" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Standing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phase" (
    "id" TEXT NOT NULL,
    "name" "PhaseName" NOT NULL DEFAULT 'DIECISAVOS_DE_FINAL',
    "order" INTEGER NOT NULL,
    "tournamentId" TEXT NOT NULL,

    CONSTRAINT "Phase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Standing_tournamentId_teamId_key" ON "Standing"("tournamentId", "teamId");

-- CreateIndex
CREATE UNIQUE INDEX "Phase_tournamentId_name_key" ON "Phase"("tournamentId", "name");

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "Phase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Standing" ADD CONSTRAINT "Standing_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Standing" ADD CONSTRAINT "Standing_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase" ADD CONSTRAINT "Phase_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;
