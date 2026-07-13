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
        tournamentTeams: true,
        matches: true, // Incluir partidos para contar programados
        // Slug de la org para linkear DIRECTO a la URL canónica (N9)
        organization: { select: { slug: true } },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return torneos as ITorneo[];
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
      include: {
        tournamentTeams: true,
        matches: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return torneos as ITorneo[];
  } catch (error) {
    console.error("Error al obtener torneos del panel:", error);
    throw error;
  }
}
