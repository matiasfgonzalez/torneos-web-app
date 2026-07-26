/*
  M13 — `TournamentFormat` pasa de 14 valores a 3.

  Postgres no deja quitar valores de un enum: hay que crear el tipo nuevo,
  convertir la columna con un CASE y recién ahí borrar el viejo.

  Mapeo (ningún torneo pierde su semántica):
    LIGA, IDA_Y_VUELTA, ROUND_ROBIN, TODOS_CONTRA_TODOS,
    LIGUILLA, PUNTOS_ACUMULADOS, SUIZO, AMISTOSO      → LIGA
    COPA, PLAYOFFS, DOBLE_ELIMINACION, ELIMINACION_DIRECTA → ELIMINACION_DIRECTA
    GRUPOS, MIXTO                                     → GRUPOS
*/

-- Data migration: "ida y vuelta" era un FORMATO y a la vez un flag. El flag es
-- el que respeta el generador de fixture, así que antes de perder el valor del
-- enum se traslada la intención a `homeAndAway`.
UPDATE "Tournament" SET "homeAndAway" = true WHERE "format" = 'IDA_Y_VUELTA';

-- Enum nuevo
CREATE TYPE "TournamentFormat_new" AS ENUM ('LIGA', 'ELIMINACION_DIRECTA', 'GRUPOS');

-- Conversión de la columna con el mapeo. El DEFAULT se saca y se repone: no se
-- puede castear una columna que tiene un default del tipo viejo.
ALTER TABLE "Tournament" ALTER COLUMN "format" DROP DEFAULT;

ALTER TABLE "Tournament"
  ALTER COLUMN "format" TYPE "TournamentFormat_new"
  USING (
    CASE "format"::text
      WHEN 'COPA' THEN 'ELIMINACION_DIRECTA'
      WHEN 'PLAYOFFS' THEN 'ELIMINACION_DIRECTA'
      WHEN 'DOBLE_ELIMINACION' THEN 'ELIMINACION_DIRECTA'
      WHEN 'ELIMINACION_DIRECTA' THEN 'ELIMINACION_DIRECTA'
      WHEN 'GRUPOS' THEN 'GRUPOS'
      WHEN 'MIXTO' THEN 'GRUPOS'
      ELSE 'LIGA'
    END
  )::"TournamentFormat_new";

ALTER TABLE "Tournament" ALTER COLUMN "format" SET DEFAULT 'LIGA';

-- Swap de tipos
DROP TYPE "TournamentFormat";
ALTER TYPE "TournamentFormat_new" RENAME TO "TournamentFormat";
