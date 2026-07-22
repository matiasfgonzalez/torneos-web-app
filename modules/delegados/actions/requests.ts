"use server";

import { revalidatePath } from "next/cache";

import type { ApprovalStatus } from "@prisma/client";

import { db } from "@/lib/db";
import { checkUser } from "@/lib/checkUser";
import { requireActionOrgAccess } from "@/lib/orgAuth";
import { getOrgManagerIds, notify } from "@/lib/notifications";
import { safeDeleteAssets } from "@/lib/cloudinary";

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

  // La liga se entera ahora, no cuando entra al panel: la solicitud está
  // esperando una respuesta suya y hasta que llegue el equipo no puede jugar.
  await notify(
    await getOrgManagerIds(team.organizationId),
    {
      type: "SOLICITUD_DELEGADO_RECIBIDA",
      teamName: team.name,
      requesterName: user.name ?? user.email,
      isNewTeam: false,
    },
    { exclude: user.id },
  );

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

  // Fuera de la transacción: si el commit falla, no se notifica un equipo que
  // no existe (y un email ya no se puede desenviar).
  await notify(
    await getOrgManagerIds(org.id),
    {
      type: "SOLICITUD_DELEGADO_RECIBIDA",
      teamName: name,
      requesterName: user.name ?? user.email,
      isNewTeam: true,
    },
    { exclude: user.id },
  );

  revalidatePath("/mi-equipo");
  return {
    success: true,
    message: `Propusiste ${name}. La liga tiene que aprobarlo antes de que puedas inscribirlo.`,
  };
}

// ============================================================
// Lado del delegado: cancelar, transferir, renunciar (N13)
// ============================================================

/**
 * Cancelar una solicitud propia que todavía está PENDIENTE.
 *
 * Se **borra la fila** en vez de marcarla RECHAZADO: la liga no rechazó nada, y
 * dejarla como rechazada ensuciaría su auditoría con una decisión que nunca
 * tomó. Al borrarla, además, el `@@unique([userId, teamId])` queda libre y la
 * persona puede volver a pedirlo más adelante.
 */
export async function cancelMyTeamRequest(
  teamId: string,
): Promise<DelegateActionResult> {
  const user = await checkUser();
  if (!user) return { success: false, error: "Necesitás iniciar sesión" };

  const request = await db.teamManager.findUnique({
    where: { userId_teamId: { userId: user.id, teamId } },
    select: {
      id: true,
      status: true,
      team: {
        select: {
          id: true,
          name: true,
          enabled: true,
          logoPublicId: true,
          _count: { select: { tournamentTeams: true, managers: true } },
        },
      },
    },
  });

  if (!request) return { success: false, error: "No tenés una solicitud para este equipo" };
  if (request.status === "APROBADO") {
    return {
      success: false,
      error: "Ya sos el delegado de este equipo. Si querés dejar el rol, usá «Dejar de ser delegado».",
    };
  }
  if (request.status !== "PENDIENTE") {
    return { success: false, error: "Esta solicitud ya fue resuelta" };
  }

  // Misma regla que al rechazar: si era una propuesta de equipo nuevo que nunca
  // se habilitó, no tiene historial y nadie más la pidió, el equipo se va con
  // la solicitud. Si algo de eso cambió, el equipo se queda y lo resuelve la liga.
  const isUnusedProposal =
    !request.team.enabled &&
    request.team._count.tournamentTeams === 0 &&
    request.team._count.managers === 1;

  await db.$transaction(async (tx) => {
    await tx.teamManager.delete({ where: { id: request.id } });
    if (isUnusedProposal) {
      await tx.team.delete({ where: { id: request.team.id } });
    }
  });

  if (isUnusedProposal) {
    // Prevención de huérfanos (M9), fuera de la transacción.
    await safeDeleteAssets([request.team.logoPublicId]);
  }

  // A la liga no se le notifica: la solicitud desaparece de su bandeja y un
  // aviso de "alguien se arrepintió" es ruido, no información que la haga actuar.
  revalidatePath("/mi-equipo");
  revalidatePath("/admin/delegados");
  return {
    success: true,
    message: isUnusedProposal
      ? `Se canceló la propuesta de ${request.team.name}.`
      : `Se canceló tu solicitud para ${request.team.name}.`,
  };
}

/**
 * Proponer a otra persona como delegado del equipo (transferencia, N13).
 *
 * **La liga sigue aprobando.** Es la regla que sostiene todo N13 —"si no,
 * cualquiera se declara delegado de cualquier equipo"—: si un delegado pudiera
 * pasarle el rol a quien quiera, alcanzaría con reclamar un equipo, ser
 * aprobado y transferírselo a un tercero para saltearse el control.
 *
 * El delegado actual **mantiene su rol** hasta que resuelva la liga: así el
 * equipo nunca queda sin nadie a cargo si la transferencia se rechaza o se
 * demora. Cuando el sucesor queda aprobado, el saliente usa `resignMyDelegation`.
 */
export async function transferMyDelegation(
  teamId: string,
  email: string,
): Promise<DelegateActionResult> {
  const user = await checkUser();
  if (!user) return { success: false, error: "Necesitás iniciar sesión" };

  const mine = await db.teamManager.findUnique({
    where: { userId_teamId: { userId: user.id, teamId } },
    select: { status: true, team: { select: { id: true, name: true, organizationId: true } } },
  });
  if (mine?.status !== "APROBADO") {
    return { success: false, error: "No representás a este equipo" };
  }

  const target = email.trim().toLowerCase();
  if (!target) return { success: false, error: "Escribí el email de la persona" };
  if (target === user.email.toLowerCase()) {
    return { success: false, error: "Ese es tu propio email" };
  }

  const nuevo = await db.user.findUnique({
    where: { email: target },
    select: { id: true, name: true, email: true },
  });
  if (!nuevo) {
    return {
      success: false,
      error: "No hay ninguna cuenta con ese email. La persona tiene que registrarse en GOLAZO antes de que puedas pasarle el equipo.",
    };
  }

  const existing = await db.teamManager.findUnique({
    where: { userId_teamId: { userId: nuevo.id, teamId } },
    select: { status: true },
  });
  if (existing?.status === "APROBADO") {
    return { success: false, error: "Esa persona ya es delegada de este equipo" };
  }
  if (existing?.status === "PENDIENTE") {
    return { success: false, error: "Esa persona ya tiene una solicitud pendiente para este equipo" };
  }

  await db.teamManager.upsert({
    where: { userId_teamId: { userId: nuevo.id, teamId } },
    create: {
      userId: nuevo.id,
      teamId,
      message: `Transferencia propuesta por ${user.name ?? user.email}, delegado actual.`,
    },
    update: {
      status: "PENDIENTE",
      message: `Transferencia propuesta por ${user.name ?? user.email}, delegado actual.`,
      decidedById: null,
      decidedAt: null,
    },
  });

  await notify(
    await getOrgManagerIds(mine.team.organizationId),
    {
      type: "SOLICITUD_DELEGADO_RECIBIDA",
      teamName: mine.team.name,
      requesterName: nuevo.name ?? nuevo.email,
      isNewTeam: false,
    },
    { exclude: user.id },
  );

  revalidatePath("/mi-equipo");
  revalidatePath("/admin/delegados");
  return {
    success: true,
    message: `Le propusiste el equipo a ${nuevo.name ?? nuevo.email}. Cuando la liga lo apruebe vas a poder dejar tu rol.`,
  };
}

/** Dejar de ser delegado de un equipo. Completa la transferencia. */
export async function resignMyDelegation(
  teamId: string,
): Promise<DelegateActionResult> {
  const user = await checkUser();
  if (!user) return { success: false, error: "Necesitás iniciar sesión" };

  const mine = await db.teamManager.findUnique({
    where: { userId_teamId: { userId: user.id, teamId } },
    select: {
      id: true,
      status: true,
      team: {
        select: { name: true, _count: { select: { managers: true } } },
      },
    },
  });
  if (mine?.status !== "APROBADO") {
    return { success: false, error: "No representás a este equipo" };
  }

  await db.teamManager.delete({ where: { id: mine.id } });

  // Se permite aunque sea el último: el equipo queda sin delegado y la liga
  // puede aprobar a otro cuando aparezca. Bloquearlo dejaría a alguien atado a
  // un rol que ya no quiere, que es peor.
  const quedaSolo = mine.team._count.managers <= 1;

  revalidatePath("/mi-equipo");
  revalidatePath("/admin/delegados");
  return {
    success: true,
    message: quedaSolo
      ? `Dejaste de ser delegado de ${mine.team.name}. El equipo queda sin delegado hasta que la liga apruebe a otra persona.`
      : `Dejaste de ser delegado de ${mine.team.name}.`,
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
  | { ok: true; request: { id: string; status: ApprovalStatus }; user: AppUser };

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

  // El pendiente de N13: hasta acá el delegado se enteraba solo si volvía a
  // mirar /mi-equipo.
  await notify(
    approved.userId,
    {
      type: "SOLICITUD_DELEGADO_APROBADA",
      teamName: approved.team.name,
      teamId: approved.team.id,
    },
    { exclude: user.id },
  );

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
          name: true,
          enabled: true,
          logoPublicId: true,
          _count: { select: { tournamentTeams: true, managers: true } },
        },
      },
    },
  });
  if (!full) return { success: false, error: "La solicitud no existe" };

  // Rechazar una propuesta de equipo nuevo borra el equipo: nació para esta
  // solicitud, nunca se habilitó y no tiene historial. Se comprueba igual que
  // no juegue ningún torneo ni lo pida otra persona — si algo de eso pasó,
  // el equipo se queda (deshabilitado) y lo resuelve la liga a mano.
  const isUnusedProposal =
    !full.team.enabled &&
    full.team._count.tournamentTeams === 0 &&
    full.team._count.managers === 1;

  await db.$transaction(async (tx) => {
    await tx.teamManager.update({
      where: { id: requestId },
      data: { status: "RECHAZADO", decidedById: user.id, decidedAt: new Date() },
    });

    if (isUnusedProposal) {
      await tx.team.delete({ where: { id: full.team.id } });
    }
  });

  // Prevención de huérfanos (M9): si se borró la propuesta, su logo ya no lo
  // referencia nadie. Best-effort, fuera de la transacción.
  if (isUnusedProposal) {
    await safeDeleteAssets([full.team.logoPublicId]);
  }

  // Un rechazo silencioso deja al delegado esperando una respuesta que ya
  // llegó. El nombre del equipo se manda aunque la propuesta se haya borrado:
  // el texto ya está renderizado y no depende de que la fila siga viva.
  await notify(
    full.userId,
    { type: "SOLICITUD_DELEGADO_RECHAZADA", teamName: full.team.name },
    { exclude: user.id },
  );

  revalidatePath("/admin/equipos");
  revalidatePath("/admin/delegados");
  return { success: true, message: "Solicitud rechazada." };
}
