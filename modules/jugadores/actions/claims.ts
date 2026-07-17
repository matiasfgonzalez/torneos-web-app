"use server";

import { revalidatePath } from "next/cache";

import { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import { checkUser } from "@/lib/checkUser";
import { canEditPlayer, logPlayerCreate } from "@/lib/playerAuth";
import { nationalIdSchema } from "@/lib/validators/player";
import { getPlatformAdminIds, notify } from "@/lib/notifications";

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
  | {
      success: false;
      error: string;
      /**
       * Para que la UI ofrezca el paso siguiente (N14b):
       * - NOT_FOUND → el DNI no existe: ofrecer crear la propia ficha.
       * - DISPUTE_AVAILABLE → la ficha está vinculada a quien la autocreó:
       *   ofrecer iniciar una disputa (requiere evidencia).
       */
      code?: "NOT_FOUND" | "DISPUTE_AVAILABLE";
    };

/** La ficha que este usuario ya reclamó (aprobada o pendiente). */
export async function getMyPlayerClaim() {
  const user = await checkUser();
  if (!user) return null;

  const claim = await db.playerClaim.findFirst({
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
  if (!claim) return null;

  // Disputa (N14b): mi reclamo PENDIENTE sobre una ficha que ya tiene dueño.
  // La UI le explica al disputante que lo resuelve el administrador, no su liga.
  const isDispute =
    claim.status === "PENDIENTE" &&
    !!(await db.playerClaim.findFirst({
      where: {
        playerId: claim.playerId,
        status: "APROBADO",
        userId: { not: user.id },
      },
      select: { id: true },
    }));

  return { ...claim, isDispute };
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
    select: { id: true, name: true, deletedAt: true, createdById: true },
  });

  if (!player || player.deletedAt) {
    return {
      success: false,
      code: "NOT_FOUND",
      error:
        "Ningún club te cargó todavía con ese DNI. Podés crear tu ficha vos mismo acá abajo.",
    };
  }

  // Otra persona ya es dueña de esa ficha
  const taken = await db.playerClaim.findFirst({
    where: { playerId: player.id, status: "APROBADO" },
    select: { userId: true },
  });
  if (taken) {
    // Disputa de titularidad (N14b): si el dueño actual es quien AUTOCREÓ la
    // ficha, nadie del club verificó que sea esa persona — el reclamo no se
    // rechaza automático, sino que queda en una cola que resuelve solo el
    // ADMINISTRADOR con la evidencia de ambos. Si el dueño fue confirmado por
    // su liga/delegado (alguien que lo conoce), el rechazo automático sigue.
    const selfOwned = taken.userId === player.createdById;
    if (!selfOwned) {
      return {
        success: false,
        error:
          "Esa ficha ya está vinculada a otra cuenta. Si creés que hay un error, hablá con tu liga.",
      };
    }

    const evidence = message?.trim() ?? "";
    if (evidence.length < 10) {
      return {
        success: false,
        code: "DISPUTE_AVAILABLE",
        error:
          "Esa ficha está vinculada a otra cuenta que la creó por su cuenta. Si es tuya, contanos cómo podés demostrarlo e iniciamos una disputa que revisa el administrador.",
      };
    }

    await db.playerClaim.upsert({
      where: { userId_playerId: { userId: user.id, playerId: player.id } },
      create: { userId: user.id, playerId: player.id, message: evidence },
      update: {
        status: "PENDIENTE",
        message: evidence,
        decidedById: null,
        decidedAt: null,
      },
    });

    // La disputa la resuelve solo el ADMINISTRADOR, así que se le avisa a él.
    // El dueño actual **no** recibe aviso: todavía no hay nada resuelto, y
    // avisarle antes de que alguien mire la evidencia lo invita a reaccionar
    // contra el reclamante, que puede ser el titular real.
    await notify(
      await getPlatformAdminIds(),
      {
        type: "FICHA_DISPUTA_ABIERTA",
        playerName: player.name,
        claimantName: user.name ?? user.email,
      },
      { exclude: user.id },
    );

    revalidatePath("/mi-ficha");
    return {
      success: true,
      message: `Iniciaste una disputa por la ficha de ${player.name}. El administrador de GOLAZO la va a revisar con la evidencia de ambas partes.`,
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
 * El jugador crea SU PROPIA ficha (N14b, decisión D14).
 *
 * Hasta ahora la ficha solo la cargaba un club: quien todavía no jugaba en
 * ninguna liga de GOLAZO terminaba en un callejón ("cuando tu delegado te
 * sume..."). Ahora, si su DNI no existe, la crea él mismo y **nace siendo su
 * dueño** (claim APROBADO automático) — consistente con `canEditPlayer`, que ya
 * trata a creador y dueño como responsables de la ficha.
 *
 * Mitigaciones contra la suplantación (crear la ficha del DNI de otro):
 * - la fecha de nacimiento es obligatoria (segundo factor barato: quien tiene
 *   el documento en la mano la sabe);
 * - queda auditado quién la creó (`createdById` + AuditLog);
 * - si la persona real aparece después, puede iniciar una **disputa** que
 *   resuelve el ADMINISTRADOR (ver `requestPlayerClaim`) — la autocreación
 *   nunca bloquea al titular verdadero.
 *
 * Al crearla se aceptan explícitamente los Términos y la Política de
 * Privacidad (el titular carga sus propios datos: el mejor caso de la Ley
 * 25.326).
 */
export async function createOwnPlayer(input: {
  dni: string;
  name: string;
  /** "YYYY-MM-DD" del input date — string local, ver lib/date-input. */
  birthDate: string;
  acceptedPolicies: boolean;
}): Promise<ClaimResult> {
  const user = await checkUser();
  if (!user) return { success: false, error: "Necesitás iniciar sesión" };

  if (!input.acceptedPolicies) {
    return {
      success: false,
      error:
        "Tenés que aceptar los Términos y la Política de Privacidad para crear tu ficha.",
    };
  }

  const dni = nationalIdSchema.safeParse(input.dni);
  if (!dni.success) {
    return { success: false, error: "Revisá el DNI: solo números, sin puntos" };
  }

  const name = input.name.trim();
  if (name.length < 2 || name.length > 120) {
    return { success: false, error: "Escribí tu nombre y apellido" };
  }

  // Fecha local a mediodía: parsear "YYYY-MM-DD" a secas la toma como UTC
  // medianoche y en Argentina la muestra corrida un día (bug ya visto en F3).
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.birthDate)) {
    return { success: false, error: "Elegí tu fecha de nacimiento" };
  }
  const birthDate = new Date(`${input.birthDate}T12:00:00`);
  const year = birthDate.getFullYear();
  if (Number.isNaN(birthDate.getTime()) || year < 1915 || birthDate > new Date()) {
    return { success: false, error: "Revisá tu fecha de nacimiento" };
  }

  // Una persona, una ficha: mismo límite que el reclamo
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

  try {
    const player = await db.$transaction(async (tx) => {
      const created = await tx.player.create({
        data: {
          name,
          nationalId: dni.data,
          birthDate,
          createdById: user.id,
        },
      });
      // Quien crea su propia ficha es su dueño: claim APROBADO en el acto,
      // con constancia de que fue una autovinculación.
      await tx.playerClaim.create({
        data: {
          userId: user.id,
          playerId: created.id,
          status: "APROBADO",
          message: "Ficha creada por su titular",
          decidedById: user.id,
          decidedAt: new Date(),
        },
      });
      return created;
    });

    await logPlayerCreate(user.id, player.id, {
      name: player.name,
      nationalId: player.nationalId,
    });

    revalidatePath("/mi-ficha");
    return {
      success: true,
      message: `¡Listo, ${name}! Tu ficha quedó creada y vinculada a tu cuenta.`,
    };
  } catch (error) {
    // Carrera: alguien creó una ficha con ese DNI entre la búsqueda y el alta
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        error:
          "Ya existe una ficha con ese DNI. Buscala arriba y reclamala como tuya.",
      };
    }
    console.error("No se pudo crear la ficha propia:", error);
    return { success: false, error: "No se pudo crear tu ficha. Probá de nuevo." };
  }
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
 *
 * **Excepción — disputas (N14b):** un reclamo sobre una ficha que YA tiene
 * dueño es una disputa de titularidad y la resuelve solo el ADMINISTRADOR. No
 * puede quedar en la bandeja del dueño actual: es parte interesada y
 * `canEditPlayer` lo dejaría rechazar a su rival — la regla de AGENT_RULES de
 * que quien aprueba no puede ser parte del pedido.
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
  if (claims.length === 0) return [];

  // ¿Cuáles son disputas? Las fichas de estos reclamos que ya tienen un
  // claim APROBADO (con su dueño actual, para mostrar las dos partes).
  const owners = await db.playerClaim.findMany({
    where: {
      playerId: { in: claims.map((c) => c.playerId) },
      status: "APROBADO",
    },
    select: { playerId: true, user: { select: { name: true, email: true } } },
  });
  const ownerByPlayer = new Map(owners.map((o) => [o.playerId, o.user]));

  const withOwner = claims.map((claim) => ({
    ...claim,
    /** Dueño actual de la ficha — presente solo si el reclamo es una disputa. */
    currentOwner: ownerByPlayer.get(claim.playerId) ?? null,
  }));

  if (user.role === "ADMINISTRADOR") return withOwner;

  const regular = withOwner.filter((claim) => !claim.currentOwner);

  // Se filtra por responsabilidad sobre cada ficha. No se puede hacer en el
  // `where` porque "ser responsable" cruza participación, delegación y autoría.
  const allowed = await Promise.all(
    regular.map((claim) => canEditPlayer(user, claim.playerId)),
  );

  return regular.filter((_, index) => allowed[index]);
}

async function authForClaim(claimId: string) {
  const user = await checkUser();
  if (!user) return { ok: false as const, error: "Necesitás iniciar sesión" };

  const claim = await db.playerClaim.findUnique({
    where: { id: claimId },
    select: {
      id: true,
      status: true,
      userId: true,
      playerId: true,
      player: { select: { name: true } },
    },
  });
  if (!claim) return { ok: false as const, error: "La solicitud no existe" };

  // Una ficha tiene un solo dueño. Prisma no permite un índice único parcial
  // ("único entre los APROBADO"), así que la regla se sostiene acá. Si ya hay
  // dueño, este reclamo es una DISPUTA (N14b) y la resuelve solo el
  // ADMINISTRADOR: el dueño actual pasa canEditPlayer pero es parte interesada.
  const currentOwner = await db.playerClaim.findFirst({
    where: { playerId: claim.playerId, status: "APROBADO" },
    select: { id: true, userId: true },
  });
  if (currentOwner && user.role !== "ADMINISTRADOR") {
    return {
      ok: false as const,
      error:
        "Esta solicitud es una disputa de titularidad: la resuelve el administrador de la plataforma",
    };
  }

  if (!(await canEditPlayer(user, claim.playerId))) {
    return { ok: false as const, error: "No podés resolver esta solicitud" };
  }
  if (claim.status !== "PENDIENTE") {
    return { ok: false as const, error: "Esta solicitud ya fue resuelta" };
  }

  return { ok: true as const, claim, user, currentOwner };
}

export async function approvePlayerClaim(claimId: string): Promise<ClaimResult> {
  const ctx = await authForClaim(claimId);
  if (!ctx.ok) return { success: false, error: ctx.error };

  // Disputa (N14b): acá solo llega el ADMINISTRADOR (authForClaim). Aprobar
  // al disputante transfiere la titularidad — el claim del dueño anterior se
  // revoca en la misma transacción, con constancia en AuditLog.
  if (ctx.currentOwner) {
    const decidedAt = new Date();
    await db.$transaction([
      db.playerClaim.update({
        where: { id: ctx.currentOwner.id },
        data: { status: "RECHAZADO", decidedById: ctx.user.id, decidedAt },
      }),
      db.playerClaim.update({
        where: { id: claimId },
        data: { status: "APROBADO", decidedById: ctx.user.id, decidedAt },
      }),
      db.auditLog.create({
        data: {
          userId: ctx.user.id,
          action: "playerClaim.transfer",
          entity: "Player",
          entityId: ctx.claim.playerId,
          payload: { de: ctx.currentOwner.userId, a: ctx.claim.userId },
        },
      }),
    ]);

    // Los dos lados de la disputa se enteran del resultado. El que la pierde
    // también: se quedó sin su ficha y tiene que poder saberlo.
    await notify(
      ctx.claim.userId,
      { type: "FICHA_APROBADA", playerName: ctx.claim.player.name },
      { exclude: ctx.user.id },
    );
    await notify(
      ctx.currentOwner.userId,
      { type: "FICHA_RECHAZADA", playerName: ctx.claim.player.name },
      { exclude: ctx.user.id },
    );

    revalidatePath("/admin/delegados");
    revalidatePath("/mi-ficha");
    return {
      success: true,
      message: `Disputa resuelta: la ficha de ${ctx.claim.player.name} pasó a su nuevo dueño.`,
    };
  }

  await db.playerClaim.update({
    where: { id: claimId },
    data: { status: "APROBADO", decidedById: ctx.user.id, decidedAt: new Date() },
  });

  await notify(
    ctx.claim.userId,
    { type: "FICHA_APROBADA", playerName: ctx.claim.player.name },
    { exclude: ctx.user.id },
  );

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

  await notify(
    ctx.claim.userId,
    { type: "FICHA_RECHAZADA", playerName: ctx.claim.player.name },
    { exclude: ctx.user.id },
  );

  revalidatePath("/admin/delegados");
  revalidatePath("/mi-ficha");
  return { success: true, message: "Solicitud rechazada." };
}
