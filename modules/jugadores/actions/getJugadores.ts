"use server";

import { IPlayer } from "@modules/jugadores/types";
import { db } from "@/lib/db";
import { getPanelOrgIds } from "@/lib/orgAuth";
import { playerOrgScopeWhere } from "@/lib/playerAuth";

/**
 * Listado del PANEL admin (N3): los jugadores que **participan en los torneos**
 * de las organizaciones del usuario (ADMINISTRADOR ve todos, salvo "ver como
 * organización" activo). Sin sesión devuelve [] — el listado incluye PII (DNI,
 * fecha de nacimiento).
 *
 * Antes filtraba por `Player.organizationId`, que ya no existe: la ficha es
 * global (N12). Lo que hace "mío" a un jugador es que juegue en un torneo mío,
 * no quién lo cargó.
 */
export async function getJugadores(): Promise<IPlayer[]> {
  try {
    const orgIds = await getPanelOrgIds();
    if (orgIds?.length === 0) return [];

    const jugadores = await db.player.findMany({
      where: playerOrgScopeWhere(orgIds),
      orderBy: {
        createdAt: "desc",
      },
      // El panel necesita saber si el jugador tiene historial para decidir si
      // se puede eliminar o solo deshabilitar (ver actions/players.ts).
      include: {
        _count: { select: { teamPlayer: true } },
      },
    });

    return jugadores as IPlayer[];
  } catch (error) {
    console.error("Error al obtener jugadores:", error);
    throw error;
  }
}
