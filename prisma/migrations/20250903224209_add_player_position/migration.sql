/*
  Warnings:

  - The `position` column on the `Player` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."PlayerPosition" AS ENUM ('ARQUERO', 'DEFENSOR_CENTRAL', 'LATERAL_DERECHO', 'LATERAL_IZQUIERDO', 'CARRILERO_DERECHO', 'CARRILERO_IZQUIERDO', 'VOLANTE_DEFENSIVO', 'PIVOTE', 'VOLANTE_CENTRAL', 'VOLANTE_OFENSIVO', 'INTERIOR_DERECHO', 'INTERIOR_IZQUIERDO', 'ENGANCHE', 'EXTREMO_DERECHO', 'EXTREMO_IZQUIERDO', 'DELANTERO_CENTRO', 'SEGUNDO_DELANTERO', 'FALSO_9');

-- AlterTable
ALTER TABLE "public"."Player" DROP COLUMN "position",
ADD COLUMN     "position" "public"."PlayerPosition";
