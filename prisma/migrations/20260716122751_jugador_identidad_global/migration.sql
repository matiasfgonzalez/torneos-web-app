-- Identidad global de jugador (N12 / N13).
--
-- La ficha de jugador deja de pertenecer a una liga: pasa a haber UNA ficha por
-- persona en toda la plataforma, identificada por su DNI. Qué jugadores ve una
-- liga se deriva de la participación (TeamPlayer → TournamentTeam → Tournament),
-- no de un `organizationId`.
--
-- Escrita a mano en vez de generada: `prisma migrate dev` avisa de pérdida de
-- datos porque `nationalId` pasa a NOT NULL, y el backfill hay que decidirlo.

-- 1) Backfill de fichas sin DNI ------------------------------------------------
-- El DNI pasa a ser obligatorio, pero puede haber fichas viejas sin él. Se les
-- pone un marcador **visiblemente temporal y único** en vez de inventar un
-- documento: así la liga las ve rotas y las corrige, en vez de quedar con un
-- dato falso que parece real.
UPDATE "Player"
SET "nationalId" = 'SIN-DNI-' || substring("id" from 1 for 8)
WHERE "nationalId" IS NULL;

-- Si dos fichas de ligas distintas comparten DNI (la misma persona cargada dos
-- veces, que es justo lo que este cambio viene a evitar), el índice único de
-- abajo falla y la migración se detiene sin escribir nada. Es lo correcto:
-- fusionar esas fichas es una decisión de negocio, no algo que resuelva un
-- UPDATE a ciegas.

-- 2) DNI: obligatorio y único en toda la plataforma ---------------------------
ALTER TABLE "Player" ALTER COLUMN "nationalId" SET NOT NULL;

DROP INDEX IF EXISTS "Player_organizationId_nationalId_key";
DROP INDEX IF EXISTS "Player_organizationId_idx";

CREATE UNIQUE INDEX "Player_nationalId_key" ON "Player"("nationalId");
CREATE INDEX "Player_name_idx" ON "Player"("name");

-- 3) La ficha deja de tener dueño ---------------------------------------------
ALTER TABLE "Player" DROP CONSTRAINT IF EXISTS "Player_organizationId_fkey";
ALTER TABLE "Player" DROP COLUMN "organizationId";

-- 4) Trazabilidad de alta (no da propiedad: solo dice quién la cargó) ----------
ALTER TABLE "Player" ADD COLUMN "createdById" TEXT;

ALTER TABLE "Player" ADD CONSTRAINT "Player_createdById_fkey"
  FOREIGN KEY ("createdById") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
