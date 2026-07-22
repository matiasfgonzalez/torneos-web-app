"use server";

import { db } from "@/lib/db";
import { checkUser } from "@/lib/checkUser";

/** Consultas del área del delegado (N13). */

export interface ClaimableTeam {
  id: string;
  name: string;
  homeCity: string | null;
  logoUrl: string | null;
  organizationName: string;
  /** Ya tiene delegado aprobado: no se puede reclamar. */
  taken: boolean;
}

/**
 * Busca equipos por nombre para reclamar, en todas las ligas.
 *
 * Devuelve solo equipos habilitados: uno deshabilitado está de baja o es una
 * propuesta de otra persona todavía sin aprobar (regla de F3/N13).
 */
export async function searchTeamsToClaim(
  query: string,
): Promise<ClaimableTeam[]> {
  const user = await checkUser();
  if (!user) return [];

  const term = query.trim();
  if (term.length < 2) return [];

  const teams = await db.team.findMany({
    where: {
      deletedAt: null,
      enabled: true,
      name: { contains: term, mode: "insensitive" },
      organization: { status: "ACTIVA" },
    },
    select: {
      id: true,
      name: true,
      homeCity: true,
      logoUrl: true,
      organization: { select: { name: true } },
      managers: {
        where: { status: "APROBADO" },
        select: { id: true },
        take: 1,
      },
    },
    orderBy: { name: "asc" },
    take: 10,
  });

  return teams.map((team) => ({
    id: team.id,
    name: team.name,
    homeCity: team.homeCity,
    logoUrl: team.logoUrl,
    organizationName: team.organization.name,
    taken: team.managers.length > 0,
  }));
}

/** Ligas activas, para proponer un equipo nuevo. */
export async function getOpenOrganizations() {
  return db.organization.findMany({
    where: { status: "ACTIVA" },
    select: { id: true, name: true, locality: true },
    orderBy: { name: "asc" },
  });
}

/** Solicitudes y equipos del delegado que está logueado. */
export async function getMyTeamRequests() {
  const user = await checkUser();
  if (!user) return [];

  return db.teamManager.findMany({
    where: { userId: user.id },
    include: {
      team: {
        select: {
          id: true,
          name: true,
          logoUrl: true,
          homeCity: true,
          enabled: true,
          // Campos que el delegado puede editar desde `/mi-equipo` (la ficha
          // de su club). No se traen `enabled`/`deletedAt`/`organizationId`
          // como editables: eso lo maneja la liga.
          shortName: true,
          description: true,
          history: true,
          coach: true,
          yearFounded: true,
          homeColor: true,
          awayColor: true,
          logoPublicId: true,
          organization: { select: { name: true, slug: true } },
          _count: { select: { tournamentTeams: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Planteles del delegado: un plantel por torneo en el que juega cada equipo.
 *
 * La ficha del jugador es una sola (global, N12); lo que hay por torneo es su
 * `TeamPlayer`. Por eso la misma persona aparece en dos planteles distintos sin
 * estar cargada dos veces.
 */
export async function getMyRosters() {
  const user = await checkUser();
  if (!user) return [];

  const managerships = await db.teamManager.findMany({
    where: { userId: user.id, status: "APROBADO" },
    select: { teamId: true },
  });
  const teamIds = managerships.map((m) => m.teamId);
  if (teamIds.length === 0) return [];

  const rosters = await db.tournamentTeam.findMany({
    where: { teamId: { in: teamIds } },
    select: {
      id: true,
      registrationStatus: true,
      team: { select: { id: true, name: true } },
      tournament: { select: { id: true, name: true, status: true } },
      teamPlayer: {
        select: {
          id: true,
          number: true,
          position: true,
          player: { select: { id: true, name: true, nationalId: true } },
          _count: { select: { goals: true, cards: true } },
        },
        orderBy: { player: { name: "asc" } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return rosters.map((r) => ({
    id: r.id,
    registrationStatus: r.registrationStatus,
    teamName: r.team.name,
    tournamentName: r.tournament.name,
    players: r.teamPlayer.map((tp) => ({
      id: tp.id,
      number: tp.number,
      position: tp.position,
      playerName: tp.player.name,
      nationalId: tp.player.nationalId,
      hasHistory: tp._count.goals > 0 || tp._count.cards > 0,
    })),
  }));
}
