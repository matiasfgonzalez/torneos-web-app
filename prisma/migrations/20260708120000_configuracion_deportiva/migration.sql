-- AlterTable: configuración deportiva por torneo (N7)
ALTER TABLE "Tournament" ADD COLUMN "pointsWin" INTEGER NOT NULL DEFAULT 3;
ALTER TABLE "Tournament" ADD COLUMN "pointsDraw" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Tournament" ADD COLUMN "pointsLoss" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Tournament" ADD COLUMN "walkoverScore" INTEGER NOT NULL DEFAULT 3;
ALTER TABLE "Tournament" ADD COLUMN "tiebreakers" JSONB;

-- AlterTable: ganador por walkover (el server fija el marcador)
ALTER TABLE "Match" ADD COLUMN "walkoverWinnerTeamId" TEXT;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_walkoverWinnerTeamId_fkey" FOREIGN KEY ("walkoverWinnerTeamId") REFERENCES "TournamentTeam"("id") ON DELETE SET NULL ON UPDATE CASCADE;
