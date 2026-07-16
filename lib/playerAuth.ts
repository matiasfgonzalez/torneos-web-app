import type { Prisma } from "@prisma/client";
import { checkUser } from "@/lib/checkUser";
import { db } from "@/lib/db";
import { canManageOrg } from "@/lib/orgAuth";
import { getManagedTeamIds } from "@/lib/teamAuth";

/**
 * Autorización sobre la ficha de un jugador (N12/N13).
 *
 * La ficha es **global**: no tiene `organizationId`, así que no se puede
 * preguntar "¿es de mi liga?". El permiso se resuelve **por participación**:
 * te deja tocar la ficha si el jugador juega en un torneo tuyo (liga) o en un
 * equipo tuyo (delegado).
 *
 * Decisión del product owner (2026-07-14): **cualquier delegado que tenga al
 * jugador en su plantel puede editar sus datos**, y todo cambio queda
 * registrado en `AuditLog` con quién lo hizo (ver `logPlayerChange`).
 */

type AppUser = NonNullable<Awaited<ReturnType<typeof checkUser>>>;

/**
 * Filtro de Prisma: jugadores que participan en los torneos de estas ligas.
 *
 * Reemplaza a `orgScopeWhere(orgIds)` para `Player`. `orgIds === null` (admin
 * sin "ver como") = sin restricción.
 */
export function playerOrgScopeWhere(
  orgIds: string[] | null,
): Prisma.PlayerWhereInput {
  if (orgIds === null) return {};
  return {
    teamPlayer: {
      some: {
        tournamentTeam: { tournament: { organizationId: { in: orgIds } } },
      },
    },
  };
}

/** Filtro de Prisma: jugadores en el plantel de alguno de estos equipos. */
export function playerTeamScopeWhere(
  teamIds: string[],
): Prisma.PlayerWhereInput {
  return { teamPlayer: { some: { tournamentTeam: { teamId: { in: teamIds } } } } };
}

/**
 * ¿Puede este usuario editar la ficha del jugador?
 *
 * - ADMINISTRADOR de plataforma: siempre.
 * - Quien la creó: sí — para corregir lo que acaba de cargar (una ficha recién
 *   creada todavía no participa en ningún lado, así que ningún otro chequeo la
 *   alcanzaría).
 * - Delegado con el jugador en su plantel: sí (decisión del owner).
 * - Gestor de una liga donde el jugador juega: sí.
 */
export async function canEditPlayer(
  user: AppUser,
  playerId: string,
): Promise<boolean> {
  if (user.role === "ADMINISTRADOR") return true;

  const player = await db.player.findUnique({
    where: { id: playerId },
    select: { createdById: true },
  });
  if (!player) return false;
  if (player.createdById === user.id) return true;

  // ¿Está en el plantel de un equipo que representa?
  const managedTeamIds = await getManagedTeamIds(user);
  if (managedTeamIds.length > 0) {
    const inMyRoster = await db.teamPlayer.findFirst({
      where: { playerId, tournamentTeam: { teamId: { in: managedTeamIds } } },
      select: { id: true },
    });
    if (inMyRoster) return true;
  }

  // ¿Juega en un torneo de una liga que gestiona?
  const participations = await db.teamPlayer.findMany({
    where: { playerId },
    select: { tournamentTeam: { select: { tournament: { select: { organizationId: true } } } } },
  });

  const orgIds = [
    ...new Set(participations.map((p) => p.tournamentTeam.tournament.organizationId)),
  ];
  for (const orgId of orgIds) {
    if (await canManageOrg(user, orgId)) return true;
  }

  return false;
}

// ============================================================
// Historial de cambios
// ============================================================

/** Campos de identidad cuyo cambio importa auditar. */
const AUDITED_FIELDS = [
  "name",
  "nationalId",
  "birthDate",
  "birthPlace",
  "nationality",
  "position",
  "number",
  "status",
  "imageUrl",
  "imageUrlFace",
] as const;

type AuditedPlayer = Record<string, unknown>;

/**
 * Registra en `AuditLog` qué cambió de la ficha y quién lo hizo (decisión del
 * owner: la ficha la puede editar cualquier delegado que la tenga, así que
 * tiene que quedar rastro de quién tocó qué).
 *
 * Guarda **solo los campos que cambiaron**, con su valor anterior y el nuevo:
 * un diff se lee de un vistazo, un snapshot completo no.
 */
export async function logPlayerChange(
  userId: string,
  playerId: string,
  before: AuditedPlayer,
  after: AuditedPlayer,
): Promise<void> {
  const changes: Record<string, { de: unknown; a: unknown }> = {};

  for (const field of AUDITED_FIELDS) {
    const prev = before[field] ?? null;
    const next = after[field] ?? null;
    // Las fechas no se comparan con !==: dos Date del mismo instante son
    // objetos distintos y todo cambio de fecha parecería real.
    const prevKey = prev instanceof Date ? prev.getTime() : prev;
    const nextKey = next instanceof Date ? next.getTime() : next;
    if (prevKey !== nextKey) {
      changes[field] = { de: prev, a: next };
    }
  }

  if (Object.keys(changes).length === 0) return;

  try {
    await db.auditLog.create({
      data: {
        userId,
        action: "player.update",
        entity: "Player",
        entityId: playerId,
        payload: changes as Prisma.InputJsonValue,
      },
    });
  } catch (error) {
    // El historial no puede tumbar la edición: se registra el fallo y sigue.
    console.error("No se pudo registrar el cambio del jugador:", error);
  }
}

/** Alta de ficha: deja constancia de quién la creó. */
export async function logPlayerCreate(
  userId: string,
  playerId: string,
  data: AuditedPlayer,
): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        userId,
        action: "player.create",
        entity: "Player",
        entityId: playerId,
        payload: {
          name: String(data.name ?? ""),
          nationalId: String(data.nationalId ?? ""),
        },
      },
    });
  } catch (error) {
    console.error("No se pudo registrar el alta del jugador:", error);
  }
}
