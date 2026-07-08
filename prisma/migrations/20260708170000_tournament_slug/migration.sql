-- AlterTable: slug público de torneo (N9). Nullable para no romper filas
-- existentes; se backfillea con prisma/backfill-tournament-slugs.js y la app
-- lo setea siempre al crear/editar. El índice único permite múltiples NULL.
ALTER TABLE "Tournament" ADD COLUMN "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Tournament_organizationId_slug_key" ON "Tournament"("organizationId", "slug");
