"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { checkUser } from "@/lib/checkUser";
import { canEditPlayer } from "@/lib/playerAuth";
import { nationalIdSchema } from "@/lib/validators/player";

/**
 * El jugador reclama su propia ficha (N12).
 *
 * La ficha la carga un delegado o la liga; el jugador después pide ser su dueño
 * para ver sus estadísticas de todas las ligas y gestionar sus datos.
 *
 * **Quién aprueba:** los responsables de la ficha — la liga donde juega, el
 * delegado que lo tiene en su plantel, o quien la cargó. Es el mismo criterio
 * que `canEditPlayer`, y no es casualidad: es exactamente la gente que puede
 * reconocerlo. La plataforma no tiene forma de verificar que ese usuario es esa
 * persona; quien lo conoce, sí.
 */

export type ClaimResult =
  | { success: true; message: string }
  | { success: false; error: string };

/** La ficha que este usuario ya reclamó (aprobada o pendiente). */
export async function getMyPlayerClaim() {
  const user = await checkUser();
  if (!user) return null;

  return db.playerClaim.findFirst({
    where: { userId: user.id, status: { in: ["PENDIENTE", "APROBADO"] } },
    include: {
      player: {
        select: {
          id: true,
          name: true,
          nationalId: true,
          imageUrlFace: true,
          position: true,
        },
      },
    },
  });
}

/**
 * Pide ser el dueño de una ficha, buscándola por DNI.
 *
 * Se exige el **DNI exacto**, igual que la búsqueda del delegado: con identidad
 * global, una búsqueda difusa sería una guía de datos personales de toda la
 * plataforma. Acá además el DNI es la prueba de identidad más razonable que
 * tenemos: es el propio documento de quien reclama.
 */
export async function requestPlayerClaim(
  rawDni: string,
  message?: string,
): Promise<ClaimResult> {
  const user = await checkUser();
  if (!user) return { success: false, error: "Necesitás iniciar sesión" };

  const dni = nationalIdSchema.safeParse(rawDni);
  if (!dni.success) {
    return { success: false, error: "Revisá el DNI: solo números, sin puntos" };
  }

  // Una persona reclama una ficha, no varias
  const mine = await db.playerClaim.findFirst({
    where: { userId: user.id, status: { in: ["PENDIENTE", "APROBADO"] } },
    select: { status: true },
  });
  if (mine) {
    return {
      success: false,
      error:
        mine.status === "APROBADO"
          ? "Ya tenés una ficha vinculada a tu cuenta."
          : "Ya tenés una solicitud esperando respuesta.",
    };
  }

  const player = await db.player.findUnique({
    where: { nationalId: dni.data },
    select: { id: true, name: true, deletedAt: true },
  });

  if (!player || player.deletedAt) {
    return {
      success: false,
      error:
        "Ningún club te cargó todavía con ese DNI. Cuando tu delegado te sume a un plantel vas a poder reclamar tu ficha.",
    };
  }

  // Otra persona ya es dueña de esa ficha
  const taken = await db.playerClaim.findFirst({
    where: { playerId: player.id, status: "APROBADO" },
    select: { userId: true },
  });
  if (taken) {
    return {
      success: false,
      error:
        "Esa ficha ya está vinculada a otra cuenta. Si creés que hay un error, hablá con tu liga.",
    };
  }

  await db.playerClaim.upsert({
    where: { userId_playerId: { userId: user.id, playerId: player.id } },
    create: { userId: user.id, playerId: player.id, message: message || null },
    update: {
      status: "PENDIENTE",
      message: message || null,
      decidedById: null,
      decidedAt: null,
    },
  });

  revalidatePath("/mi-ficha");
  return {
    success: true,
    message: `Pediste vincular la ficha de ${player.name}. Tu liga o tu delegado tienen que confirmarlo.`,
  };
}

/**
 * Trayectoria del jugador dueño de la ficha: un renglón por torneo jugado, con
 * sus goles y tarjetas. Es lo que hace que reclamar la ficha valga la pena —
 * sus datos, cruzando todas las ligas.
 */
export async function getMyPlayerCareer(playerId: string) {
  const rosters = await db.teamPlayer.findMany({
    where: { playerId },
    select: {
      id: true,
      number: true,
      tournamentTeam: {
        select: {
          team: { select: { name: true } },
          tournament: {
            select: {
              id: true,
              name: true,
              slug: true,
              status: true,
              organization: { select: { name: true, slug: true } },
            },
          },
        },
      },
      _count: { select: { goals: true, cards: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return rosters.map((r) => ({
    id: r.id,
    number: r.number,
    teamName: r.tournamentTeam.team.name,
    tournamentName: r.tournamentTeam.tournament.name,
    tournamentSlug: r.tournamentTeam.tournament.slug,
    organizationName: r.tournamentTeam.tournament.organization.name,
    organizationSlug: r.tournamentTeam.tournament.organization.slug,
    goals: r._count.goals,
    cards: r._count.cards,
  }));
}

// ============================================================
// Lado de quien aprueba
// ============================================================

/**
 * Reclamos pendientes que ESTE usuario puede resolver: los de fichas de las que
 * es responsable (su liga, su plantel, o que él cargó).
 */
export async function getPendingPlayerClaims() {
  const user = await checkUser();
  if (!user) return [];

  const claims = await db.playerClaim.findMany({
    where: { status: "PENDIENTE" },
    include: {
      user: { select: { name: true, email: true } },
      player: { select: { id: true, name: true, nationalId: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  // Se filtra por responsabilidad sobre cada ficha. No se puede hacer en el
  // `where` porque "ser responsable" cruza participación, delegación y autoría.
  const allowed = await Promise.all(
    claims.map((claim) => canEditPlayer(user, claim.playerId)),
  );

  return claims.filter((_, index) => allowed[index]);
}

async function authForClaim(claimId: string) {
  const user = await checkUser();
  if (!user) return { ok: false as const, error: "Necesitás iniciar sesión" };

  const claim = await db.playerClaim.findUnique({
    where: { id: claimId },
    select: {
      id: true,
      status: true,
      playerId: true,
      player: { select: { name: true } },
    },
  });
  if (!claim) return { ok: false as const, error: "La solicitud no existe" };

  if (!(await canEditPlayer(user, claim.playerId))) {
    return { ok: false as const, error: "No podés resolver esta solicitud" };
  }
  if (claim.status !== "PENDIENTE") {
    return { ok: false as const, error: "Esta solicitud ya fue resuelta" };
  }

  return { ok: true as const, claim, user };
}

export async function approvePlayerClaim(claimId: string): Promise<ClaimResult> {
  const ctx = await authForClaim(claimId);
  if (!ctx.ok) return { success: false, error: ctx.error };

  // Una ficha tiene un solo dueño. Prisma no permite un índice único parcial
  // ("único entre los APROBADO"), así que la regla se sostiene acá.
  const taken = await db.playerClaim.findFirst({
    where: { playerId: ctx.claim.playerId, status: "APROBADO" },
    select: { id: true },
  });
  if (taken) {
    return {
      success: false,
      error: "Esa ficha ya fue vinculada a otra cuenta.",
    };
  }

  await db.playerClaim.update({
    where: { id: claimId },
    data: { status: "APROBADO", decidedById: ctx.user.id, decidedAt: new Date() },
  });

  revalidatePath("/admin/delegados");
  revalidatePath("/mi-ficha");
  return {
    success: true,
    message: `${ctx.claim.player.name} ya gestiona su ficha.`,
  };
}

export async function rejectPlayerClaim(claimId: string): Promise<ClaimResult> {
  const ctx = await authForClaim(claimId);
  if (!ctx.ok) return { success: false, error: ctx.error };

  await db.playerClaim.update({
    where: { id: claimId },
    data: { status: "RECHAZADO", decidedById: ctx.user.id, decidedAt: new Date() },
  });

  revalidatePath("/admin/delegados");
  revalidatePath("/mi-ficha");
  return { success: true, message: "Solicitud rechazada." };
}
