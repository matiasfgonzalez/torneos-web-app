-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "paymentAlias" TEXT,
ADD COLUMN     "paymentHolder" TEXT,
ADD COLUMN     "paymentInstructions" TEXT;
