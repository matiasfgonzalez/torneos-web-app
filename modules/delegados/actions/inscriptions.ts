"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { checkUser } from "@/lib/checkUser";
import { getManagedTeamIds, requireActionTeamManager } from "@/lib/teamAuth";
import { requireActionOrgAccess } from "@/lib/orgAuth";

/**
 * Inscripción de un equipo a un torneo, pedida por el delegado (S3/N13).
 *
 * `RegistrationStatus` (INSCRIPTO/PENDIENTE/RECHAZADO) ya estaba en el schema
 * desde N2 **sin usar**, puesto justo para esto: el delegado pide, la liga
 * aprueba. El `TournamentTeam` se crea PENDIENTE, así el delegado puede ir
 * armando el plantel mientras espera la respuesta.
 */

export type InscriptionResult =
  | { success: true; message: string }
  | { success: false; error: string };

/**
 * Torneos a los que el delegado puede anotar sus equipos: los que están en
 * inscripción, de las ligas donde tiene equipos.
 */
export async function getOpenTournamentsForMyTeams() {
  const user = await checkUser();
  if (!user) return [];

  const teamIds = await getManagedTeamIds(user);
  if (teamIds.length === 0) return [];

  const teams = await db.team.findMany({
    where: { id: { in: teamIds } },
    select: { id: true, name: true, organizationId: true },
  });
  const orgIds = [...new Set(teams.map((t) => t.organizationId))];

  const tournaments = await db.tournament.findMany({
    where: {
      organizationId: { in: orgIds },
      deletedAt: null,
      enabled: true,
      // Solo los que están recibiendo equipos: anotarse a un torneo ya
      // empezado desordena el fixture y la tabla.
      status: "INSCRIPCION",
    },
    select: {
      id: true,
      name: true,
      locality: true,
      startDate: true,
      organizationId: true,
      organization: { select: { name: true } },
      tournamentTeams: {
        where: { teamId: { in: teamIds } },
        select: { id: true, teamId: true, registrationStatus: true },
      },
    },
    orderBy: { startDate: "asc" },
  });

  return tournaments.map((t) => ({
    id: t.id,
    name: t.name,
    locality: t.locality,
    startDate: t.startDate.toISOString(),
    organizationName: t.organization.name,
    // Equipos míos de esa liga que todavía puedo anotar
    myTeams: teams
      .filter((team) => team.organizationId === t.organizationId)
      .map((team) => ({
        id: team.id,
        name: team.name,
        registration: t.tournamentTeams.find((tt) => tt.teamId === team.id) ?? null,
      })),
  }));
}

/** El delegado pide inscribir su equipo a un torneo. */
export async function requestInscription(input: {
  tournamentId: string;
  teamId: string;
}): Promise<InscriptionResult> {
  const auth = await requireActionTeamManager(input.teamId);
  if (auth.error) return { success: false, error: auth.error };

  const [tournament, team] = await Promise.all([
    db.tournament.findFirst({
      where: { id: input.tournamentId, deletedAt: null },
      select: { id: true, name: true, status: true, organizationId: true },
    }),
    db.team.findUnique({
      where: { id: input.teamId },
      select: { id: true, name: true, enabled: true, organizationId: true },
    }),
  ]);

  if (!tournament) return { success: false, error: "El torneo no existe" };
  if (!team) return { success: false, error: "El equipo no existe" };

  if (tournament.status !== "INSCRIPCION") {
    return {
      success: false,
      error: "Este torneo no está recibiendo inscripciones.",
    };
  }
  if (!team.enabled) {
    return {
      success: false,
      error: "Tu equipo todavía no está aprobado por la liga.",
    };
  }
  // El equipo pertenece a una liga; no se anota a torneos de otra
  if (team.organizationId !== tournament.organizationId) {
    return {
      success: false,
      error: "Ese torneo es de otra liga.",
    };
  }

  const existing = await db.tournamentTeam.findFirst({
    where: { tournamentId: tournament.id, teamId: team.id },
    select: { registrationStatus: true },
  });
  if (existing) {
    const label = {
      INSCRIPTO: "ya está inscripto",
      PENDIENTE: "ya tiene una solicitud pendiente",
      RECHAZADO: "fue rechazado en este torneo",
    }[existing.registrationStatus];
    return { success: false, error: `${team.name} ${label}.` };
  }

  await db.tournamentTeam.create({
    data: {
      tournamentId: tournament.id,
      teamId: team.id,
      registrationStatus: "PENDIENTE",
    },
  });

  revalidatePath("/mi-equipo");
  revalidatePath(`/admin/torneos/${tournament.id}`);
  return {
    success: true,
    message: `Pediste inscribir a ${team.name} en ${tournament.name}. Mientras la liga responde ya podés ir armando el plantel.`,
  };
}

// ============================================================
// Lado de la liga
// ============================================================

/** Inscripciones pendientes de aprobación en los torneos de una liga. */
export async function getPendingInscriptions(organizationId: string) {
  const auth = await requireActionOrgAccess(organizationId);
  if (auth.error) return [];

  return db.tournamentTeam.findMany({
    where: {
      registrationStatus: "PENDIENTE",
      tournament: { organizationId, deletedAt: null },
    },
    select: {
      id: true,
      createdAt: true,
      team: { select: { name: true, homeCity: true } },
      tournament: { select: { name: true } },
      _count: { select: { teamPlayer: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}

async function authForInscription(tournamentTeamId: string) {
  const tt = await db.tournamentTeam.findUnique({
    where: { id: tournamentTeamId },
    select: {
      id: true,
      registrationStatus: true,
      team: { select: { name: true } },
      tournament: { select: { id: true, organizationId: true } },
    },
  });
  if (!tt) return { ok: false as const, error: "La inscripción no existe" };

  const auth = await requireActionOrgAccess(tt.tournament.organizationId);
  if (auth.error) return { ok: false as const, error: auth.error };

  return { ok: true as const, tt };
}

export async function approveInscription(
  tournamentTeamId: string,
): Promise<InscriptionResult> {
  const ctx = await authForInscription(tournamentTeamId);
  if (!ctx.ok) return { success: false, error: ctx.error };

  await db.tournamentTeam.update({
    where: { id: tournamentTeamId },
    data: { registrationStatus: "INSCRIPTO" },
  });

  revalidatePath(`/admin/torneos/${ctx.tt.tournament.id}`);
  revalidatePath("/mi-equipo");
  return { success: true, message: `${ctx.tt.team.name} quedó inscripto.` };
}

export async function rejectInscription(
  tournamentTeamId: string,
): Promise<InscriptionResult> {
  const ctx = await authForInscription(tournamentTeamId);
  if (!ctx.ok) return { success: false, error: ctx.error };

  // Se marca RECHAZADO en vez de borrar: el plantel que el delegado ya cargó
  // cuelga de este TournamentTeam (`onDelete: Cascade`) y borrarlo se lo
  // llevaría puesto. Además queda constancia de la decisión.
  await db.tournamentTeam.update({
    where: { id: tournamentTeamId },
    data: { registrationStatus: "RECHAZADO" },
  });

  revalidatePath(`/admin/torneos/${ctx.tt.tournament.id}`);
  revalidatePath("/mi-equipo");
  return { success: true, message: `Inscripción de ${ctx.tt.team.name} rechazada.` };
}
