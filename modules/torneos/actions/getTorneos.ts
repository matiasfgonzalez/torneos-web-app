"use server";

import { ITorneo } from "@modules/torneos/types";
import { db } from "@/lib/db";
import { getPanelOrgIds, orgScopeWhere } from "@/lib/orgAuth";

/** Listado PÚBLICO de torneos (difusión: todas las organizaciones). */
export async function getTorneos(): Promise<ITorneo[]> {
  try {
    const torneos = await db.tournament.findMany({
      where: {
        enabled: true, // Solo torneos habilitados
        deletedAt: null, // Excluir eliminados lógicamente
      },
      include: {
        // A3: antes traía TODOS los equipos y TODOS los partidos de cada torneo
        // solo para contarlos en el hero. Ahora `_count` los cuenta en la BD
        // (matches, filtrado a PROGRAMADO), sin traer las filas.
        _count: {
          select: {
            tournamentTeams: true,
            matches: { where: { status: "PROGRAMADO" } },
          },
        },
        // Slug de la org para linkear DIRECTO a la URL canónica (N9)
        organization: { select: { slug: true } },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return torneos as unknown as ITorneo[];
  } catch (error) {
    console.error("Error al obtener torneos:", error);
    throw error;
  }
}

/**
 * Listado del PANEL admin (N3): solo torneos de las organizaciones del
 * usuario (ADMINISTRADOR ve todos, salvo "ver como organización" activo).
 */
export async function getAdminTorneos(): Promise<ITorneo[]> {
  try {
    const orgIds = await getPanelOrgIds();
    const torneos = await db.tournament.findMany({
      where: {
        enabled: true,
        deletedAt: null,
        ...orgScopeWhere(orgIds),
      },
      // A3: el panel no usa los equipos ni los partidos de cada torneo en la
      // lista (StatsCards/ListTournaments miran otros campos), así que no se
      // traen. Se deja `_count` por si una tarjeta quiere mostrar el número.
      include: {
        _count: {
          select: {
            tournamentTeams: true,
            matches: { where: { status: "PROGRAMADO" } },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return torneos as unknown as ITorneo[];
  } catch (error) {
    console.error("Error al obtener torneos del panel:", error);
    throw error;
  }
}
