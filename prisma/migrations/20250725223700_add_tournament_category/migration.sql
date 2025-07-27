/*
  Warnings:

  - Changed the type of `category` on the `Tournament` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "TournamentCategory" AS ENUM ('LIBRE', 'SENIOR', 'SUB_17', 'RESERVA', 'PRIMEA', 'VETERANO', 'PREVETERANO', 'FEMENINO', 'INFANTIL');

-- AlterTable
ALTER TABLE "Tournament" DROP COLUMN "category",
ADD COLUMN     "category" "TournamentCategory" NOT NULL;
