-- CreateEnum
CREATE TYPE "InscriptionPayStatus" AS ENUM ('EXENTO', 'PENDIENTE', 'INFORMADO', 'PAGADO');

-- AlterTable
ALTER TABLE "Tournament" ADD COLUMN     "inscriptionFee" DECIMAL(10,2),
ADD COLUMN     "inscriptionPaymentInfo" TEXT;

-- AlterTable
ALTER TABLE "TournamentTeam" ADD COLUMN     "paymentAmount" DECIMAL(10,2),
ADD COLUMN     "paymentConfirmedAt" TIMESTAMP(3),
ADD COLUMN     "paymentConfirmedById" TEXT,
ADD COLUMN     "paymentNote" TEXT,
ADD COLUMN     "paymentReceiptPublicId" TEXT,
ADD COLUMN     "paymentReceiptUrl" TEXT,
ADD COLUMN     "paymentStatus" "InscriptionPayStatus" NOT NULL DEFAULT 'EXENTO';
