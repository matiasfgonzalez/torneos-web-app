"use server";

import type { Prisma } from "@/lib/generated/prisma/client";
import { IPlayer } from "@modules/jugadores/types";
import { db } from "@/lib/db";
import { getPanelOrgIds } from "@/lib/orgAuth";
import { playerOrgScopeWhere } from "@/lib/playerAuth";
import type { ParsedTableParams } from "@/lib/tableParams";

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

/** Columnas ordenables de la tabla → `orderBy` de Prisma (M7). */
const PLAYER_ORDER_BY: Record<string, keyof Prisma.PlayerOrderByWithRelationInput> =
  {
    player: "name",
    position: "position",
    birthPlace: "birthPlace",
    status: "status",
  };

/**
 * Versión paginada server-side del listado del panel (M7). Mismo scope que
 * `getJugadores`, pero con `where` de búsqueda/filtro, `orderBy` y `skip/take`
 * armados desde la URL — devuelve solo la página pedida + el total para paginar.
 */
export async function getJugadoresPaged(
  params: ParsedTableParams,
): Promise<{ rows: IPlayer[]; total: number }> {
  const orgIds = await getPanelOrgIds();
  if (orgIds?.length === 0) return { rows: [], total: 0 };

  const conditions: Prisma.PlayerWhereInput[] = [playerOrgScopeWhere(orgIds)];

  if (params.q) {
    conditions.push({
      OR: [
        { name: { contains: params.q, mode: "insensitive" } },
        { nationality: { contains: params.q, mode: "insensitive" } },
        { birthPlace: { contains: params.q, mode: "insensitive" } },
      ],
    });
  }

  const status = params.filters.status;
  if (status === "disabled") {
    conditions.push({ enabled: false });
  } else if (status) {
    // Mismo criterio que el filtro cliente: habilitado + ese estado.
    conditions.push({ enabled: true, status: status as never });
  }

  const where: Prisma.PlayerWhereInput = { AND: conditions };

  const orderCol = params.sort ? PLAYER_ORDER_BY[params.sort] : undefined;
  const orderBy: Prisma.PlayerOrderByWithRelationInput = orderCol
    ? { [orderCol]: params.dir }
    : { createdAt: "desc" };

  const [rows, total] = await Promise.all([
    db.player.findMany({
      where,
      orderBy,
      skip: params.skip,
      take: params.take,
      include: { _count: { select: { teamPlayer: true } } },
    }),
    db.player.count({ where }),
  ]);

  return { rows: rows as IPlayer[], total };
}

/**
 * Contadores para las tarjetas de resumen del panel de jugadores. Se calculan
 * con `count` agregados (no cargando todas las filas) para no traer la base
 * entera solo para los KPIs cuando la tabla ya pagina.
 */
export async function getJugadoresStats(): Promise<{
  total: number;
  activos: number;
  suspendidos: number;
  goles: number;
}> {
  const orgIds = await getPanelOrgIds();
  if (orgIds?.length === 0)
    return { total: 0, activos: 0, suspendidos: 0, goles: 0 };

  const base = playerOrgScopeWhere(orgIds);

  const [total, activos, suspendidos, goles] = await Promise.all([
    db.player.count({ where: base }),
    db.player.count({ where: { AND: [base, { status: "ACTIVO" as never }] } }),
    db.player.count({
      where: { AND: [base, { status: "SUSPENDIDO" as never }] },
    }),
    db.goal.count({ where: { teamPlayer: { player: base } } }),
  ]);

  return { total, activos, suspendidos, goles };
}
