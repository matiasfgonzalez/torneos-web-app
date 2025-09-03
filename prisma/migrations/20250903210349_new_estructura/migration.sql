/*
  Warnings:

  - The values [TERMINADO] on the enum `MatchStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `playerId` on the `Goal` table. All the data in the column will be lost.
  - You are about to drop the column `teamId` on the `TeamPlayer` table. All the data in the column will be lost.
  - You are about to drop the `_PhaseToTournament` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name,order]` on the table `Phase` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[playerId,tournamentTeamId]` on the table `TeamPlayer` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `teamPlayerId` to the `Goal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tournamentTeamId` to the `TeamPlayer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."MatchStatus_new" AS ENUM ('PROGRAMADO', 'EN_JUEGO', 'ENTRETIEMPO', 'FINALIZADO', 'SUSPENDIDO', 'POSTERGADO', 'CANCELADO', 'WALKOVER');
ALTER TABLE "public"."Match" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."Match" ALTER COLUMN "status" TYPE "public"."MatchStatus_new" USING ("status"::text::"public"."MatchStatus_new");
ALTER TYPE "public"."MatchStatus" RENAME TO "MatchStatus_old";
ALTER TYPE "public"."MatchStatus_new" RENAME TO "MatchStatus";
DROP TYPE "public"."MatchStatus_old";
ALTER TABLE "public"."Match" ALTER COLUMN "status" SET DEFAULT 'PROGRAMADO';
COMMIT;

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."PlayerStatus" ADD VALUE 'RETIRADO';
ALTER TYPE "public"."PlayerStatus" ADD VALUE 'TRANSFERIDO';
ALTER TYPE "public"."PlayerStatus" ADD VALUE 'PRUEBA';
ALTER TYPE "public"."PlayerStatus" ADD VALUE 'EXPULSADO';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."TournamentCategory" ADD VALUE 'SUB_20';
ALTER TYPE "public"."TournamentCategory" ADD VALUE 'SEGUNDA';
ALTER TYPE "public"."TournamentCategory" ADD VALUE 'SUPERVETERANO';
ALTER TYPE "public"."TournamentCategory" ADD VALUE 'MASCULINO';
ALTER TYPE "public"."TournamentCategory" ADD VALUE 'MINI';
ALTER TYPE "public"."TournamentCategory" ADD VALUE 'ESCUELITA';
ALTER TYPE "public"."TournamentCategory" ADD VALUE 'MIXTO';
ALTER TYPE "public"."TournamentCategory" ADD VALUE 'MASTER';
ALTER TYPE "public"."TournamentCategory" ADD VALUE 'JUVENIL';
ALTER TYPE "public"."TournamentCategory" ADD VALUE 'M30';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."TournamentFormat" ADD VALUE 'DOBLE_ELIMINACION';
ALTER TYPE "public"."TournamentFormat" ADD VALUE 'ROUND_ROBIN';
ALTER TYPE "public"."TournamentFormat" ADD VALUE 'SUIZO';
ALTER TYPE "public"."TournamentFormat" ADD VALUE 'MIXTO';
ALTER TYPE "public"."TournamentFormat" ADD VALUE 'PLAYOFFS';
ALTER TYPE "public"."TournamentFormat" ADD VALUE 'LIGUILLA';
ALTER TYPE "public"."TournamentFormat" ADD VALUE 'TODOS_CONTRA_TODOS';
ALTER TYPE "public"."TournamentFormat" ADD VALUE 'PUNTOS_ACUMULADOS';
ALTER TYPE "public"."TournamentFormat" ADD VALUE 'AMISTOSO';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."TournamentStatus" ADD VALUE 'BORRADOR';
ALTER TYPE "public"."TournamentStatus" ADD VALUE 'INSCRIPCION';
ALTER TYPE "public"."TournamentStatus" ADD VALUE 'SUSPENDIDO';
ALTER TYPE "public"."TournamentStatus" ADD VALUE 'CANCELADO';
ALTER TYPE "public"."TournamentStatus" ADD VALUE 'ARCHIVADO';

-- DropForeignKey
ALTER TABLE "public"."Goal" DROP CONSTRAINT "Goal_playerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TeamPlayer" DROP CONSTRAINT "TeamPlayer_teamId_fkey";

-- DropForeignKey
ALTER TABLE "public"."_PhaseToTournament" DROP CONSTRAINT "_PhaseToTournament_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_PhaseToTournament" DROP CONSTRAINT "_PhaseToTournament_B_fkey";

-- DropIndex
DROP INDEX "public"."Phase_name_key";

-- DropIndex
DROP INDEX "public"."TeamPlayer_playerId_teamId_key";

-- AlterTable
ALTER TABLE "public"."Goal" DROP COLUMN "playerId",
ADD COLUMN     "teamPlayerId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."TeamPlayer" DROP COLUMN "teamId",
ADD COLUMN     "tournamentTeamId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Tournament" ADD COLUMN     "phaseId" TEXT,
ADD COLUMN     "rules" TEXT,
ADD COLUMN     "trophy" TEXT;

-- DropTable
DROP TABLE "public"."_PhaseToTournament";

-- CreateIndex
CREATE UNIQUE INDEX "Phase_name_order_key" ON "public"."Phase"("name", "order");

-- CreateIndex
CREATE UNIQUE INDEX "TeamPlayer_playerId_tournamentTeamId_key" ON "public"."TeamPlayer"("playerId", "tournamentTeamId");

-- AddForeignKey
ALTER TABLE "public"."Tournament" ADD CONSTRAINT "Tournament_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "public"."Phase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Goal" ADD CONSTRAINT "Goal_teamPlayerId_fkey" FOREIGN KEY ("teamPlayerId") REFERENCES "public"."TeamPlayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeamPlayer" ADD CONSTRAINT "TeamPlayer_tournamentTeamId_fkey" FOREIGN KEY ("tournamentTeamId") REFERENCES "public"."TournamentTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;
