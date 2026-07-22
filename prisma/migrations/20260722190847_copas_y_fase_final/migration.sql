-- CreateEnum
CREATE TYPE "PhaseSeedSource" AS ENUM ('STANDINGS', 'WINNERS', 'LOSERS');

-- AlterTable
ALTER TABLE "TournamentPhase" ADD COLUMN     "cupName" TEXT,
ADD COLUMN     "seedFrom" INTEGER,
ADD COLUMN     "seedSource" "PhaseSeedSource",
ADD COLUMN     "seedTo" INTEGER,
ADD COLUMN     "sourcePhaseId" TEXT;

-- CreateIndex
CREATE INDEX "TournamentPhase_sourcePhaseId_idx" ON "TournamentPhase"("sourcePhaseId");

-- AddForeignKey
ALTER TABLE "TournamentPhase" ADD CONSTRAINT "TournamentPhase_sourcePhaseId_fkey" FOREIGN KEY ("sourcePhaseId") REFERENCES "TournamentPhase"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
