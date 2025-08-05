-- CreateEnum
CREATE TYPE "public"."PlayerStatus" AS ENUM ('ACTIVO', 'LESIONADO', 'SUSPENDIDO', 'NO_DISPONIBLE');

-- AlterTable
ALTER TABLE "public"."Player" ADD COLUMN     "instagramUrl" TEXT,
ADD COLUMN     "joinedAt" TIMESTAMP(3),
ADD COLUMN     "nationality" TEXT,
ADD COLUMN     "status" "public"."PlayerStatus" NOT NULL DEFAULT 'ACTIVO',
ADD COLUMN     "twitterUrl" TEXT,
ALTER COLUMN "height" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "weight" SET DATA TYPE DOUBLE PRECISION;
