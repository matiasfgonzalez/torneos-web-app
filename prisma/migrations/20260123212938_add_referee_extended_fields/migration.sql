-- CreateEnum
CREATE TYPE "public"."RefereeStatus" AS ENUM ('ACTIVO', 'INACTIVO', 'SUSPENDIDO', 'RETIRADO');

-- AlterTable
ALTER TABLE "public"."Referee" ADD COLUMN     "birthDate" TIMESTAMP(3),
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "enabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "nationalId" TEXT,
ADD COLUMN     "nationality" TEXT,
ADD COLUMN     "status" "public"."RefereeStatus" NOT NULL DEFAULT 'ACTIVO';
