-- CreateEnum
CREATE TYPE "SuspensionReason" AS ENUM ('ACUMULACION', 'ROJA', 'MANUAL');

-- AlterTable: configuración de sanciones por torneo (N8)
ALTER TABLE "Tournament" ADD COLUMN "yellowsForSuspension" INTEGER NOT NULL DEFAULT 5;
ALTER TABLE "Tournament" ADD COLUMN "matchesPerRedCard" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "Suspension" (
    "id" TEXT NOT NULL,
    "teamPlayerId" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "reason" "SuspensionReason" NOT NULL,
    "totalMatches" INTEGER NOT NULL,
    "servedMatches" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "triggerDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "sourceCardId" TEXT,
    "accumulationIndex" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Suspension_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Suspension_sourceCardId_key" ON "Suspension"("sourceCardId");

-- CreateIndex
CREATE UNIQUE INDEX "Suspension_teamPlayerId_accumulationIndex_key" ON "Suspension"("teamPlayerId", "accumulationIndex");

-- CreateIndex
CREATE INDEX "Suspension_tournamentId_isActive_idx" ON "Suspension"("tournamentId", "isActive");

-- CreateIndex
CREATE INDEX "Suspension_teamPlayerId_idx" ON "Suspension"("teamPlayerId");

-- AddForeignKey
ALTER TABLE "Suspension" ADD CONSTRAINT "Suspension_teamPlayerId_fkey" FOREIGN KEY ("teamPlayerId") REFERENCES "TeamPlayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Suspension" ADD CONSTRAINT "Suspension_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;
