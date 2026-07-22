"use server";

import { db } from "@/lib/db";

/**
 * Datos mínimos de un equipo para `generateMetadata` (M3). Query liviana aparte
 * de `getEquipoById` (que trae partidos y plantel) para no repetir el fetch
 * pesado solo por el `<head>`.
 */
export async function getEquipoMeta(id: string) {
  return db.team.findFirst({
    where: { id, deletedAt: null },
    select: {
      name: true,
      shortName: true,
      description: true,
      homeCity: true,
      logoUrl: true,
    },
  });
}
