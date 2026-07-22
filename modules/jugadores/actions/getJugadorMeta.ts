"use server";

import { db } from "@/lib/db";

/**
 * Datos mínimos de un jugador para `generateMetadata` (M3). Query liviana aparte
 * de `getJugadorById` (que trae goles, tarjetas y equipos) para no repetir el
 * fetch pesado solo por el `<head>`.
 */
export async function getJugadorMeta(id: string) {
  return db.player.findFirst({
    where: { id, deletedAt: null },
    select: {
      name: true,
      position: true,
      nationality: true,
      description: true,
      imageUrlFace: true,
      imageUrl: true,
    },
  });
}
