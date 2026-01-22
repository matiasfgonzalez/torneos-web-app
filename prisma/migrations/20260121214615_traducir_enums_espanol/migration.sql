/*
  Warnings:

  - The values [ADMIN,ORGANIZER,USER,MODERATOR] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - The values [ACTIVE,INACTIVE,SUSPENDED,PENDING] on the enum `UserStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."CardType" AS ENUM ('AMARILLA', 'ROJA');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."UserRole_new" AS ENUM ('ADMINISTRADOR', 'MODERADOR', 'EDITOR', 'ORGANIZADOR', 'USUARIO');
ALTER TABLE "public"."User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "public"."User" ALTER COLUMN "role" TYPE "public"."UserRole_new" USING ("role"::text::"public"."UserRole_new");
ALTER TYPE "public"."UserRole" RENAME TO "UserRole_old";
ALTER TYPE "public"."UserRole_new" RENAME TO "UserRole";
DROP TYPE "public"."UserRole_old";
ALTER TABLE "public"."User" ALTER COLUMN "role" SET DEFAULT 'USUARIO';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."UserStatus_new" AS ENUM ('ACTIVO', 'INACTIVO', 'SUSPENDIDO', 'PENDIENTE');
ALTER TABLE "public"."User" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."User" ALTER COLUMN "status" TYPE "public"."UserStatus_new" USING ("status"::text::"public"."UserStatus_new");
ALTER TYPE "public"."UserStatus" RENAME TO "UserStatus_old";
ALTER TYPE "public"."UserStatus_new" RENAME TO "UserStatus";
DROP TYPE "public"."UserStatus_old";
ALTER TABLE "public"."User" ALTER COLUMN "status" SET DEFAULT 'PENDIENTE';
COMMIT;

-- AlterTable
ALTER TABLE "public"."Match" ADD COLUMN     "tournamentPhaseId" TEXT;

-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "role" SET DEFAULT 'USUARIO',
ALTER COLUMN "status" SET DEFAULT 'PENDIENTE';

-- CreateTable
CREATE TABLE "public"."TournamentPhase" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TournamentPhase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Card" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "teamPlayerId" TEXT NOT NULL,
    "type" "public"."CardType" NOT NULL,
    "minute" INTEGER,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TeamPhaseStats" (
    "id" TEXT NOT NULL,
    "tournamentTeamId" TEXT NOT NULL,
    "tournamentPhaseId" TEXT NOT NULL,
    "groupId" TEXT,
    "matchesPlayed" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "draws" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "goalsFor" INTEGER NOT NULL DEFAULT 0,
    "goalsAgainst" INTEGER NOT NULL DEFAULT 0,
    "goalDifference" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 0,
    "bonusPoints" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamPhaseStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Referee" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "certificationLevel" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Referee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MatchReferee" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "refereeId" TEXT NOT NULL,
    "role" TEXT NOT NULL,

    CONSTRAINT "MatchReferee_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TeamPhaseStats_tournamentTeamId_tournamentPhaseId_key" ON "public"."TeamPhaseStats"("tournamentTeamId", "tournamentPhaseId");

-- CreateIndex
CREATE UNIQUE INDEX "MatchReferee_matchId_refereeId_key" ON "public"."MatchReferee"("matchId", "refereeId");

-- AddForeignKey
ALTER TABLE "public"."TournamentPhase" ADD CONSTRAINT "TournamentPhase_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "public"."Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Match" ADD CONSTRAINT "Match_tournamentPhaseId_fkey" FOREIGN KEY ("tournamentPhaseId") REFERENCES "public"."TournamentPhase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Card" ADD CONSTRAINT "Card_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "public"."Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Card" ADD CONSTRAINT "Card_teamPlayerId_fkey" FOREIGN KEY ("teamPlayerId") REFERENCES "public"."TeamPlayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeamPhaseStats" ADD CONSTRAINT "TeamPhaseStats_tournamentTeamId_fkey" FOREIGN KEY ("tournamentTeamId") REFERENCES "public"."TournamentTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeamPhaseStats" ADD CONSTRAINT "TeamPhaseStats_tournamentPhaseId_fkey" FOREIGN KEY ("tournamentPhaseId") REFERENCES "public"."TournamentPhase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Referee" ADD CONSTRAINT "Referee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MatchReferee" ADD CONSTRAINT "MatchReferee_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "public"."Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MatchReferee" ADD CONSTRAINT "MatchReferee_refereeId_fkey" FOREIGN KEY ("refereeId") REFERENCES "public"."Referee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
