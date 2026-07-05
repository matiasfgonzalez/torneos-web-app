-- CreateEnum
CREATE TYPE "SubStatus" AS ENUM ('ACTIVA', 'VENCIDA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "PayMethod" AS ENUM ('TRANSFERENCIA', 'EFECTIVO', 'MERCADOPAGO');

-- CreateEnum
CREATE TYPE "PayStatus" AS ENUM ('PENDIENTE', 'APROBADO', 'RECHAZADO');

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "priceMonthly" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'ARS',
    "maxActiveTournaments" INTEGER NOT NULL,
    "maxTeamsPerTournament" INTEGER NOT NULL,
    "maxMembers" INTEGER NOT NULL,
    "features" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" "SubStatus" NOT NULL DEFAULT 'ACTIVA',
    "currentPeriodEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "planId" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'ARS',
    "periodMonths" INTEGER NOT NULL DEFAULT 1,
    "method" "PayMethod" NOT NULL,
    "status" "PayStatus" NOT NULL DEFAULT 'PENDIENTE',
    "receiptUrl" TEXT,
    "receiptPublicId" TEXT,
    "externalId" TEXT,
    "notes" TEXT,
    "reviewNotes" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Plan_code_key" ON "Plan"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_organizationId_key" ON "Subscription"("organizationId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "Payment_subscriptionId_idx" ON "Payment"("subscriptionId");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;
