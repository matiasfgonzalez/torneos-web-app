"use server";

import { ITeam } from "@modules/equipos/types/types";
import { db } from "@/lib/db";
import { getPanelOrgIds, orgScopeWhere } from "@/lib/orgAuth";

/** Listado PÚBLICO de equipos (difusión: todas las organizaciones). */
export async function getEquipos(): Promise<ITeam[]> {
  try {
    const equipos = await db.team.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return equipos as ITeam[];
  } catch (error) {
    console.error("Error al obtener equipo:", error);
    throw error;
  }
}

/**
 * Listado del PANEL admin (N3): solo equipos de las organizaciones del
 * usuario (ADMINISTRADOR ve todos, salvo "ver como organización" activo).
 */
export async function getAdminEquipos(): Promise<ITeam[]> {
  try {
    const orgIds = await getPanelOrgIds();
    const equipos = await db.team.findMany({
      where: orgScopeWhere(orgIds),
      orderBy: {
        createdAt: "desc",
      },
      // El panel necesita saber si el equipo tiene historial para decidir si se
      // puede eliminar o solo deshabilitar (ver actions/teams.ts).
      include: {
        _count: { select: { tournamentTeams: true } },
      },
    });

    return equipos as ITeam[];
  } catch (error) {
    console.error("Error al obtener equipos del panel:", error);
    throw error;
  }
}
