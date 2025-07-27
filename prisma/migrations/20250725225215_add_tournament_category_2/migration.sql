/*
  Warnings:

  - The values [PRIMEA] on the enum `TournamentCategory` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TournamentCategory_new" AS ENUM ('LIBRE', 'SENIOR', 'SUB_17', 'RESERVA', 'PRIMERA', 'VETERANO', 'PREVETERANO', 'FEMENINO', 'INFANTIL');
ALTER TABLE "Tournament" ALTER COLUMN "category" TYPE "TournamentCategory_new" USING ("category"::text::"TournamentCategory_new");
ALTER TYPE "TournamentCategory" RENAME TO "TournamentCategory_old";
ALTER TYPE "TournamentCategory_new" RENAME TO "TournamentCategory";
DROP TYPE "TournamentCategory_old";
COMMIT;
