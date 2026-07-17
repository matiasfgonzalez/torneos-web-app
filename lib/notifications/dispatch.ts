import type { NotificationCategory } from "@prisma/client";

import { db } from "@/lib/db";
import {
  renderNotification,
  type NotificationPayload,
} from "@/lib/notifications/catalog";
import {
  isEmailEnabled,
  notificationEmailHtml,
  sendEmail,
} from "@/lib/notifications/email";

/**
 * Despachador de notificaciones (S5). La única puerta de entrada: los emisores
 * llaman `notify()` y no saben nada de canales, preferencias ni Resend.
 *
 * Tres reglas que valen para todos los emisores:
 *
 * 1. **Nunca lanza.** Una notificación es un efecto secundario del negocio, no
 *    el negocio. Si aprobar una inscripción notifica mal, la inscripción tiene
 *    que quedar aprobada igual. Todo va envuelto en try/catch.
 * 2. **Nunca notifica al que actuó.** El organizador que aprueba la inscripción
 *    no necesita que le avisen que la aprobó: lo acaba de hacer. Se filtra con
 *    `exclude`.
 * 3. **Fuera de la transacción.** `notify()` se llama después del commit: si se
 *    llamara adentro, un rollback dejaría una notificación de algo que no pasó,
 *    y peor, un email ya no se puede desenviar.
 */

/** Sin filas de preferencia = todo encendido (ver el modelo en schema.prisma). */
const DEFAULT_PREFERENCE = { inApp: true, email: true };

interface NotifyOptions {
  /**
   * Usuario que disparó la acción: no se notifica a sí mismo. Se acepta null
   * para los emisores donde no hay actor (un cron, el sistema).
   */
  exclude?: string | null;
}

/**
 * Notifica a uno o varios usuarios. Los duplicados y los ids nulos se limpian
 * acá — los emisores arman listas de destinatarios cruzando delegados y
 * miembros de liga, y esas listas se pisan sola (el OWNER suele ser también
 * organizador).
 */
export async function notify(
  // Acepta null/undefined sueltos: los resolvedores de destinatario devuelven
  // `string | null` (una liga puede no tener OWNER cargado) y obligar a cada
  // emisor a chequearlo antes de llamar es ruido que no evita ningún bug.
  userIds: string | null | undefined | (string | null | undefined)[],
  payload: NotificationPayload,
  options: NotifyOptions = {},
): Promise<void> {
  try {
    const targets = [...new Set((Array.isArray(userIds) ? userIds : [userIds]).filter(
      (id): id is string => Boolean(id) && id !== options.exclude,
    ))];
    if (targets.length === 0) return;

    const rendered = renderNotification(payload);

    const [users, preferences] = await Promise.all([
      db.user.findMany({
        where: { id: { in: targets } },
        select: { id: true, email: true, isActive: true },
      }),
      db.notificationPreference.findMany({
        where: { userId: { in: targets }, category: rendered.category },
        select: { userId: true, inApp: true, email: true },
      }),
    ]);

    const prefOf = (userId: string) =>
      preferences.find((p) => p.userId === userId) ?? DEFAULT_PREFERENCE;

    // Una cuenta dada de baja no recibe nada: ni campana que nadie va a leer ni
    // mails a un buzón que quizá ya no es de esa persona.
    const active = users.filter((u) => u.isActive);

    const inApp = active.filter((u) => prefOf(u.id).inApp);
    const byEmail = isEmailEnabled()
      ? active.filter((u) => prefOf(u.id).email)
      : [];

    // Los mails salen antes del insert para poder guardar `emailSentAt` en una
    // sola escritura por notificación, en vez de insertar y volver a updatear.
    const emailedIds = new Set<string>();
    if (byEmail.length > 0) {
      const html = notificationEmailHtml(rendered);
      const results = await Promise.all(
        byEmail.map(async (u) => ({
          id: u.id,
          sent: await sendEmail({
            to: u.email,
            subject: rendered.title,
            html,
          }),
        })),
      );
      for (const r of results) if (r.sent) emailedIds.add(r.id);
    }

    if (inApp.length > 0) {
      const now = new Date();
      await db.notification.createMany({
        data: inApp.map((u) => ({
          userId: u.id,
          type: rendered.type,
          category: rendered.category,
          title: rendered.title,
          body: rendered.body,
          url: rendered.url,
          emailSentAt: emailedIds.has(u.id) ? now : null,
        })),
      });
    }
  } catch (error) {
    // Se traga a propósito: ver la regla 1 del comentario de arriba.
    console.error("[notificaciones] No se pudo notificar:", payload.type, error);
  }
}

// ============================================================
// Resolución de destinatarios
// ============================================================
//
// Los emisores no saben "a quién le importa esto": preguntan por rol. Tenerlo
// acá evita que cada acción arme su propio criterio y que dos flujos parecidos
// terminen notificando a gente distinta.

/**
 * Quién gestiona una liga: OWNER y ORGANIZADOR. El COLABORADOR queda afuera —
 * carga resultados, no decide inscripciones ni delegados (tabla de permisos N1).
 */
export async function getOrgManagerIds(organizationId: string): Promise<string[]> {
  const members = await db.organizationMember.findMany({
    where: { organizationId, role: { in: ["OWNER", "ORGANIZADOR"] } },
    select: { userId: true },
  });
  return members.map((m) => m.userId);
}

/** El OWNER de la liga: plan, pagos y miembros son solo suyos (D12/N14c). */
export async function getOrgOwnerId(organizationId: string): Promise<string | null> {
  const org = await db.organization.findUnique({
    where: { id: organizationId },
    select: { ownerId: true },
  });
  return org?.ownerId ?? null;
}

/** Delegados **aprobados** de un equipo (los pendientes todavía no lo representan). */
export async function getTeamManagerIds(teamId: string): Promise<string[]> {
  const managers = await db.teamManager.findMany({
    where: { teamId, status: "APROBADO" },
    select: { userId: true },
  });
  return managers.map((m) => m.userId);
}

/** Ídem para varios equipos de una (un partido tiene dos). */
export async function getTeamManagerIdsForTeams(
  teamIds: string[],
): Promise<string[]> {
  if (teamIds.length === 0) return [];
  const managers = await db.teamManager.findMany({
    where: { teamId: { in: teamIds }, status: "APROBADO" },
    select: { userId: true },
  });
  return managers.map((m) => m.userId);
}

/** ADMINISTRADORes de plataforma: pagos a revisar y disputas de ficha. */
export async function getPlatformAdminIds(): Promise<string[]> {
  const admins = await db.user.findMany({
    where: { role: "ADMINISTRADOR", isActive: true },
    select: { id: true },
  });
  return admins.map((a) => a.id);
}

/** El dueño de una ficha de jugador (reclamo APROBADO), si tiene. */
export async function getPlayerOwnerId(playerId: string): Promise<string | null> {
  const claim = await db.playerClaim.findFirst({
    where: { playerId, status: "APROBADO" },
    select: { userId: true },
  });
  return claim?.userId ?? null;
}

export type { NotificationPayload, NotificationCategory };
