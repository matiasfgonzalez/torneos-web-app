"use server";

import type { Prisma } from "@/lib/generated/prisma/client";
import { ITeam } from "@modules/equipos/types/types";
import { db } from "@/lib/db";
import { getPanelOrgIds } from "@/lib/orgAuth";
import { teamOrgScopeWhere } from "@/lib/teamAuth";
import type { ParsedTableParams } from "@/lib/tableParams";

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
 * Listado del PANEL admin (N3): equipos propios **más** los que juegan en
 * torneos de la liga aunque los haya cargado otra (`teamOrgScopeWhere`).
 * ADMINISTRADOR ve todos, salvo "ver como organización" activo.
 */
export async function getAdminEquipos(): Promise<ITeam[]> {
  try {
    const orgIds = await getPanelOrgIds();
    const equipos = await db.team.findMany({
      where: teamOrgScopeWhere(orgIds),
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

/** Columnas ordenables de la tabla → `orderBy` de Prisma (M7). */
const TEAM_ORDER_BY: Record<string, keyof Prisma.TeamOrderByWithRelationInput> =
  {
    team: "name",
    city: "homeCity",
    coach: "coach",
    status: "enabled",
  };

/**
 * Versión paginada server-side del panel de equipos (M7). Mismo scope que
 * `getAdminEquipos`, con búsqueda/filtro/orden/página desde la URL.
 */
export async function getEquiposPaged(
  params: ParsedTableParams,
): Promise<{ rows: ITeam[]; total: number }> {
  const orgIds = await getPanelOrgIds();

  const conditions: Prisma.TeamWhereInput[] = [teamOrgScopeWhere(orgIds)];

  if (params.q) {
    conditions.push({
      OR: [
        { name: { contains: params.q, mode: "insensitive" } },
        { homeCity: { contains: params.q, mode: "insensitive" } },
        { coach: { contains: params.q, mode: "insensitive" } },
      ],
    });
  }

  const status = params.filters.status;
  if (status === "active") conditions.push({ enabled: true });
  else if (status === "disabled") conditions.push({ enabled: false });

  const where: Prisma.TeamWhereInput = { AND: conditions };

  const orderCol = params.sort ? TEAM_ORDER_BY[params.sort] : undefined;
  const orderBy: Prisma.TeamOrderByWithRelationInput = orderCol
    ? { [orderCol]: params.dir }
    : { createdAt: "desc" };

  const [rows, total] = await Promise.all([
    db.team.findMany({
      where,
      orderBy,
      skip: params.skip,
      take: params.take,
      include: { _count: { select: { tournamentTeams: true } } },
    }),
    db.team.count({ where }),
  ]);

  return { rows: rows as ITeam[], total };
}

/** Contadores del panel de equipos (agregados, no la lista entera — M7). */
export async function getEquiposStats(): Promise<{
  total: number;
  activos: number;
  deshabilitados: number;
  jugadores: number;
}> {
  const orgIds = await getPanelOrgIds();
  const base = teamOrgScopeWhere(orgIds);

  const [total, activos, deshabilitados, jugadores] = await Promise.all([
    db.team.count({ where: base }),
    db.team.count({ where: { AND: [base, { enabled: true }] } }),
    db.team.count({ where: { AND: [base, { enabled: false }] } }),
    // Jugadores que participan en equipos del scope (antes daba 0: la lista no
    // incluía `players`). Cuenta por relación TeamPlayer → TournamentTeam → Team.
    db.teamPlayer.count({ where: { tournamentTeam: { team: base } } }),
  ]);

  return { total, activos, deshabilitados, jugadores };
}
