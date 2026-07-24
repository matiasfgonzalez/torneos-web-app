"use server";

import type { Prisma } from "@prisma/client";
import { ITorneo } from "@modules/torneos/types";
import { db } from "@/lib/db";
import { getPanelOrgIds, orgScopeWhere } from "@/lib/orgAuth";
import type { ParsedTableParams } from "@/lib/tableParams";

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
    // `inscriptionFee` (Decimal) → number: la lista cruza a FiltroTorneos (client).
    return torneos.map((t) => ({
      ...t,
      inscriptionFee: t.inscriptionFee ? Number(t.inscriptionFee) : null,
    })) as unknown as ITorneo[];
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
    // `inscriptionFee` (Decimal) → number: la lista cruza a componentes cliente.
    return torneos.map((t) => ({
      ...t,
      inscriptionFee: t.inscriptionFee ? Number(t.inscriptionFee) : null,
    })) as unknown as ITorneo[];
  } catch (error) {
    console.error("Error al obtener torneos del panel:", error);
    throw error;
  }
}

/** Columnas ordenables de la tabla → `orderBy` de Prisma (M7). */
const TOURNAMENT_ORDER_BY: Record<
  string,
  keyof Prisma.TournamentOrderByWithRelationInput
> = {
  tournament: "name",
  status: "status",
  startDate: "startDate",
  endDate: "endDate",
};

/**
 * Versión paginada server-side del panel de torneos (M7). Mismo scope que
 * `getAdminTorneos`, con búsqueda/filtro/orden/página desde la URL.
 */
export async function getAdminTorneosPaged(
  params: ParsedTableParams,
): Promise<{ rows: ITorneo[]; total: number }> {
  const orgIds = await getPanelOrgIds();

  const conditions: Prisma.TournamentWhereInput[] = [
    { enabled: true, deletedAt: null, ...orgScopeWhere(orgIds) },
  ];

  if (params.q) {
    conditions.push({
      OR: [
        { name: { contains: params.q, mode: "insensitive" } },
        { locality: { contains: params.q, mode: "insensitive" } },
      ],
    });
  }

  if (params.filters.status) {
    conditions.push({ status: params.filters.status as never });
  }

  const where: Prisma.TournamentWhereInput = { AND: conditions };

  const orderCol = params.sort ? TOURNAMENT_ORDER_BY[params.sort] : undefined;
  const orderBy: Prisma.TournamentOrderByWithRelationInput = orderCol
    ? { [orderCol]: params.dir }
    : { createdAt: "desc" };

  const [rows, total] = await Promise.all([
    db.tournament.findMany({
      where,
      orderBy,
      skip: params.skip,
      take: params.take,
      include: {
        _count: {
          select: {
            tournamentTeams: true,
            matches: { where: { status: "PROGRAMADO" } },
          },
        },
      },
    }),
    db.tournament.count({ where }),
  ]);

  return {
    rows: rows.map((t) => ({
      ...t,
      inscriptionFee: t.inscriptionFee ? Number(t.inscriptionFee) : null,
    })) as unknown as ITorneo[],
    total,
  };
}

/** Contadores del panel de torneos (agregados por estado — M7). */
export async function getTorneosStats(): Promise<{
  total: number;
  activos: number;
  inscripciones: number;
  finalizados: number;
}> {
  const orgIds = await getPanelOrgIds();
  const base: Prisma.TournamentWhereInput = {
    enabled: true,
    deletedAt: null,
    ...orgScopeWhere(orgIds),
  };

  const [total, activos, inscripciones, finalizados] = await Promise.all([
    db.tournament.count({ where: base }),
    db.tournament.count({ where: { ...base, status: "ACTIVO" } }),
    db.tournament.count({ where: { ...base, status: "INSCRIPCION" } }),
    db.tournament.count({ where: { ...base, status: "FINALIZADO" } }),
  ]);

  return { total, activos, inscripciones, finalizados };
}
