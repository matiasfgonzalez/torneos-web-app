-- Cupos y fecha límite de inscripción (S3) + el jugador reclama su ficha (N12).
--
-- Escrita a mano: el rename del enum `TeamManagerStatus` → `ApprovalStatus`
-- Prisma lo resolvería tirando el tipo y recreándolo (con DROP de la columna que
-- lo usa). `ALTER TYPE ... RENAME` conserva todo.

-- 1) Vocabulario único de aprobación --------------------------------------
-- Los dos flujos que necesitan que alguien apruebe (delegado de equipo y
-- jugador reclamando su ficha) son el mismo concepto: un solo enum.
ALTER TYPE "TeamManagerStatus" RENAME TO "ApprovalStatus";

-- 2) Inscripción: cupo y fecha límite (S3) --------------------------------
-- Ambos NULL = sin límite (el comportamiento de hoy), así que los torneos que
-- ya existen no cambian de conducta.
ALTER TABLE "Tournament" ADD COLUMN "maxTeams" INTEGER;
ALTER TABLE "Tournament" ADD COLUMN "registrationDeadline" TIMESTAMP(3);

-- 3) El jugador reclama su propia ficha (N12) ------------------------------
CREATE TABLE "PlayerClaim" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDIENTE',
    "message" TEXT,
    "decidedById" TEXT,
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerClaim_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PlayerClaim_playerId_status_idx" ON "PlayerClaim"("playerId", "status");
CREATE INDEX "PlayerClaim_userId_idx" ON "PlayerClaim"("userId");
CREATE UNIQUE INDEX "PlayerClaim_userId_playerId_key" ON "PlayerClaim"("userId", "playerId");

ALTER TABLE "PlayerClaim" ADD CONSTRAINT "PlayerClaim_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlayerClaim" ADD CONSTRAINT "PlayerClaim_playerId_fkey"
  FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlayerClaim" ADD CONSTRAINT "PlayerClaim_decidedById_fkey"
  FOREIGN KEY ("decidedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
