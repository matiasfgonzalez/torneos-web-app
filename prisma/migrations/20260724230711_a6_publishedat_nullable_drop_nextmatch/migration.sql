/*
  Warnings:

  - You are about to drop the column `nextMatch` on the `Tournament` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "News" ALTER COLUMN "publishedAt" DROP NOT NULL,
ALTER COLUMN "publishedAt" DROP DEFAULT;

-- A6 (data migration): los borradores tenían un `publishedAt` = now() falso por
-- el @default. Un borrador no está publicado → no debe tener fecha. Se limpian.
UPDATE "News" SET "publishedAt" = NULL WHERE "published" = false;

-- AlterTable
ALTER TABLE "Tournament" DROP COLUMN "nextMatch";
