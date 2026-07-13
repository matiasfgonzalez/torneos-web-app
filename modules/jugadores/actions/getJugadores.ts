"use server";

import { IPlayer } from "@modules/jugadores/types";
import { db } from "@/lib/db";
import { getPanelOrgIds, orgScopeWhere } from "@/lib/orgAuth";

/**
 * Listado del PANEL admin (N3): solo jugadores de las organizaciones del
 * usuario (ADMINISTRADOR ve todos, salvo "ver como organización" activo).
 * Sin sesión devuelve [] — el listado incluye PII (DNI, fecha de nacimiento).
 */
export async function getJugadores(): Promise<IPlayer[]> {
  try {
    const orgIds = await getPanelOrgIds();
    const jugadores = await db.player.findMany({
      where: orgScopeWhere(orgIds),
      orderBy: {
        createdAt: "desc",
      },
    });

    return jugadores as IPlayer[];
  } catch (error) {
    console.error("Error al obtener jugadores:", error);
    throw error;
  }
}
