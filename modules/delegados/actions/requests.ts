"use server";

import { revalidatePath } from "next/cache";

import type { TeamManagerStatus } from "@prisma/client";

import { db } from "@/lib/db";
import { checkUser } from "@/lib/checkUser";
import { requireActionOrgAccess } from "@/lib/orgAuth";

type AppUser = NonNullable<Awaited<ReturnType<typeof checkUser>>>;

/**
 * Solicitudes de delegado (N13).
 *
 * Dos entradas al mismo flujo, siempre con aprobación de la liga (sin eso,
 * cualquiera se declara delegado de cualquier equipo):
 *
 * 1. **Reclamar** un equipo que la liga ya tiene cargado.
 * 2. **Proponer** un equipo nuevo → se crea `enabled: false` (que ya significa
 *    "existe pero no se puede usar", regla de F3) y queda habilitado al
 *    aprobarse. Si se rechaza, el equipo se borra: no tiene historial todavía.
 */

export type DelegateActionResult =
  | { success: true; message?: string }
  | { success: false; error: string };

/** Reclamar un equipo existente de una liga. */
export async function requestTeamClaim(
  teamId: string,
  message?: string,
): Promise<DelegateActionResult> {
  const user = await checkUser();
  if (!user) return { success: false, error: "Necesitás iniciar sesión" };

  const team = await db.team.findFirst({
    where: { id: teamId, deletedAt: null },
    select: { id: true, name: true, organizationId: true },
  });
  if (!team) return { success: false, error: "El equipo no existe" };

  const existing = await db.teamManager.findUnique({
    where: { userId_teamId: { userId: user.id, teamId } },
    select: { status: true },
  });

  if (existing?.status === "APROBADO") {
    return { success: false, error: "Ya representás a este equipo" };
  }
  if (existing?.status === "PENDIENTE") {
    return {
      success: false,
      error: "Ya enviaste una solicitud para este equipo. Está esperando respuesta de la liga.",
    };
  }

  // Un rechazo previo no cierra la puerta para siempre: se reusa la fila
  // (hay `@@unique([userId, teamId])`) y vuelve a quedar pendiente.
  await db.teamManager.upsert({
    where: { userId_teamId: { userId: user.id, teamId } },
    create: { userId: user.id, teamId, message: message || null },
    update: {
      status: "PENDIENTE",
      message: message || null,
      decidedById: null,
      decidedAt: null,
    },
  });

  revalidatePath("/mi-equipo");
  return {
    success: true,
    message: `Tu solicitud para representar a ${team.name} quedó enviada.`,
  };
}

/** Proponer un equipo nuevo a una liga y quedar como su delegado. */
export async function requestNewTeam(input: {
  organizationId: string;
  name: string;
  shortName?: string;
  homeCity?: string;
  yearFounded: number;
  message?: string;
}): Promise<DelegateActionResult> {
  const user = await checkUser();
  if (!user) return { success: false, error: "Necesitás iniciar sesión" };

  const org = await db.organization.findUnique({
    where: { id: input.organizationId },
    select: { id: true, status: true },
  });
  if (!org) return { success: false, error: "La liga no existe" };
  if (org.status !== "ACTIVA") {
    return { success: false, error: "Esta liga no está recibiendo equipos" };
  }

  const name = input.name.trim();
  if (name.length < 3) {
    return { success: false, error: "El nombre del equipo es muy corto" };
  }

  // Un equipo con el mismo nombre ya existe en la liga: lo correcto es
  // reclamarlo, no crear un duplicado que después alguien tiene que fusionar.
  const duplicate = await db.team.findFirst({
    where: {
      organizationId: org.id,
      deletedAt: null,
      name: { equals: name, mode: "insensitive" },
    },
    select: { id: true },
  });
  if (duplicate) {
    return {
      success: false,
      error: "Esta liga ya tiene un equipo con ese nombre. Buscalo en la lista y reclamalo en vez de crear uno nuevo.",
    };
  }

  try {
    await db.$transaction(async (tx) => {
      const team = await tx.team.create({
        data: {
          organizationId: org.id,
          name,
          shortName: input.shortName?.trim() || null,
          homeCity: input.homeCity?.trim() || null,
          yearFounded: input.yearFounded,
          // Propuesto, todavía no aprobado: existe pero no se puede usar (F3).
          // Así no aparece en el listado público ni en los selectores de la liga.
          enabled: false,
        },
      });

      await tx.teamManager.create({
        data: {
          userId: user.id,
          teamId: team.id,
          message: input.message?.trim() || null,
        },
      });
    });
  } catch (error) {
    console.error("Error al proponer equipo:", error);
    return { success: false, error: "No se pudo enviar la propuesta" };
  }

  revalidatePath("/mi-equipo");
  return {
    success: true,
    message: `Propusiste ${name}. La liga tiene que aprobarlo antes de que puedas inscribirlo.`,
  };
}

// ============================================================
// Lado de la liga: aprobar / rechazar
// ============================================================

/** Solicitudes pendientes de los equipos de una organización. */
export async function getPendingTeamRequests(organizationId: string) {
  const auth = await requireActionOrgAccess(organizationId);
  if (auth.error) return [];

  return db.teamManager.findMany({
    where: { status: "PENDIENTE", team: { organizationId, deletedAt: null } },
    include: {
      user: { select: { id: true, name: true, email: true, imageUrl: true } },
      // `enabled: false` distingue una propuesta de equipo nuevo de un reclamo
      // sobre un equipo que la liga ya tenía.
      team: { select: { id: true, name: true, enabled: true, homeCity: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}

// Unión discriminada por `ok`: `{ user?: never }` (el estilo de orgAuth) no
// narrowea al pasar el valor por otra función.
type RequestContext =
  | { ok: false; error: string }
  | { ok: true; request: { id: string; status: TeamManagerStatus }; user: AppUser };

/** Valida que quien resuelve la solicitud gestione la liga dueña del equipo. */
async function authForRequest(requestId: string): Promise<RequestContext> {
  const request = await db.teamManager.findUnique({
    where: { id: requestId },
    select: { id: true, status: true, team: { select: { organizationId: true } } },
  });
  if (!request) return { ok: false, error: "La solicitud no existe" };

  const auth = await requireActionOrgAccess(request.team.organizationId);
  if (auth.error || !auth.user) {
    return { ok: false, error: auth.error ?? "Sin permisos" };
  }

  return {
    ok: true,
    request: { id: request.id, status: request.status },
    user: auth.user,
  };
}

export async function approveTeamRequest(
  requestId: string,
): Promise<DelegateActionResult> {
  const ctx = await authForRequest(requestId);
  if (!ctx.ok) return { success: false, error: ctx.error };

  const { request, user } = ctx;
  if (request.status !== "PENDIENTE") {
    return { success: false, error: "Esta solicitud ya fue resuelta" };
  }

  const approved = await db.$transaction(async (tx) => {
    const updated = await tx.teamManager.update({
      where: { id: requestId },
      data: { status: "APROBADO", decidedById: user.id, decidedAt: new Date() },
      include: { team: { select: { id: true, name: true, enabled: true } } },
    });

    // Si era una propuesta de equipo nuevo, aprobarla lo habilita
    if (!updated.team.enabled) {
      await tx.team.update({
        where: { id: updated.team.id },
        data: { enabled: true },
      });
    }

    return updated;
  });

  revalidatePath("/admin/equipos");
  revalidatePath("/admin/delegados");
  return {
    success: true,
    message: `${approved.team.name} ya tiene delegado.`,
  };
}

export async function rejectTeamRequest(
  requestId: string,
): Promise<DelegateActionResult> {
  const ctx = await authForRequest(requestId);
  if (!ctx.ok) return { success: false, error: ctx.error };

  const { request, user } = ctx;
  if (request.status !== "PENDIENTE") {
    return { success: false, error: "Esta solicitud ya fue resuelta" };
  }

  const full = await db.teamManager.findUnique({
    where: { id: requestId },
    include: {
      team: {
        select: {
          id: true,
          enabled: true,
          _count: { select: { tournamentTeams: true, managers: true } },
        },
      },
    },
  });
  if (!full) return { success: false, error: "La solicitud no existe" };

  await db.$transaction(async (tx) => {
    await tx.teamManager.update({
      where: { id: requestId },
      data: { status: "RECHAZADO", decidedById: user.id, decidedAt: new Date() },
    });

    // Rechazar una propuesta de equipo nuevo borra el equipo: nació para esta
    // solicitud, nunca se habilitó y no tiene historial. Se comprueba igual que
    // no juegue ningún torneo ni lo pida otra persona — si algo de eso pasó,
    // el equipo se queda (deshabilitado) y lo resuelve la liga a mano.
    const isUnusedProposal =
      !full.team.enabled &&
      full.team._count.tournamentTeams === 0 &&
      full.team._count.managers === 1;

    if (isUnusedProposal) {
      await tx.team.delete({ where: { id: full.team.id } });
    }
  });

  revalidatePath("/admin/equipos");
  revalidatePath("/admin/delegados");
  return { success: true, message: "Solicitud rechazada." };
}
