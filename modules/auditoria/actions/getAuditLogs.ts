"use server";

import type { Prisma } from "@/lib/generated/prisma/client";
import { db } from "@/lib/db";
import type { ParsedTableParams } from "@/lib/tableParams";

/**
 * Lectura del registro de auditoría para `/admin/auditoria` (M8). El acceso
 * (solo ADMINISTRADOR) lo valida el page antes de llamar acá.
 */

export interface AuditLogRow {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  payload: Prisma.JsonValue;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
    imageUrl: string | null;
  } | null;
}

export async function getAuditLogsPaged(
  params: ParsedTableParams,
): Promise<{ rows: AuditLogRow[]; total: number }> {
  const conditions: Prisma.AuditLogWhereInput[] = [];

  if (params.q) {
    conditions.push({
      OR: [
        { entityId: { contains: params.q, mode: "insensitive" } },
        { user: { name: { contains: params.q, mode: "insensitive" } } },
        { user: { email: { contains: params.q, mode: "insensitive" } } },
      ],
    });
  }
  if (params.filters.entity) conditions.push({ entity: params.filters.entity });
  if (params.filters.action) conditions.push({ action: params.filters.action });

  const where: Prisma.AuditLogWhereInput = conditions.length
    ? { AND: conditions }
    : {};

  const [rows, total] = await Promise.all([
    db.auditLog.findMany({
      where,
      orderBy: { createdAt: params.dir === "asc" ? "asc" : "desc" },
      skip: params.skip,
      take: params.take,
      select: {
        id: true,
        action: true,
        entity: true,
        entityId: true,
        payload: true,
        createdAt: true,
        user: {
          select: { id: true, name: true, email: true, imageUrl: true },
        },
      },
    }),
    db.auditLog.count({ where }),
  ]);

  return { rows, total };
}

/** Contadores para el header de la vista de auditoría. */
export async function getAuditLogsStats(): Promise<{
  total: number;
  last24h: number;
}> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [total, last24h] = await Promise.all([
    db.auditLog.count(),
    db.auditLog.count({ where: { createdAt: { gte: since } } }),
  ]);
  return { total, last24h };
}
