"use server";

import { db } from "@/lib/db";
import { getEffectivePlan, getOrCreateSubscription } from "@/lib/planLimits";
import { MatchStatus } from "@prisma/client";

export interface DashboardMatch {
  id: string;
  dateTime: Date;
  stadium: string | null;
  homeScore: number | null;
  awayScore: number | null;
  status: MatchStatus;
  tournamentName: string;
  homeTeamName: string;
  homeTeamLogo: string | null;
  awayTeamName: string;
  awayTeamLogo: string | null;
}

export interface OrgDashboardData {
  organization: { id: string; name: string; slug: string };
  plan: {
    code: string;
    name: string;
    status: string;
    currentPeriodEnd: Date | null;
    maxActiveTournaments: number;
  };
  counts: { activeTournaments: number; teams: number; players: number };
  upcomingMatches: DashboardMatch[];
  pendingResultMatches: DashboardMatch[];
}

const matchInclude = {
  tournament: { select: { name: true } },
  homeTeam: { include: { team: true } },
  awayTeam: { include: { team: true } },
} as const;

type RawMatch = Awaited<
  ReturnType<
    typeof db.match.findFirstOrThrow<{ include: typeof matchInclude }>
  >
>;

function mapMatch(m: RawMatch): DashboardMatch {
  return {
    id: m.id,
    dateTime: m.dateTime,
    stadium: m.stadium,
    homeScore: m.homeScore,
    awayScore: m.awayScore,
    status: m.status,
    tournamentName: m.tournament.name,
    homeTeamName: m.homeTeam.team.shortName || m.homeTeam.team.name,
    homeTeamLogo: m.homeTeam.team.logoUrl,
    awayTeamName: m.awayTeam.team.shortName || m.awayTeam.team.name,
    awayTeamLogo: m.awayTeam.team.logoUrl,
  };
}

/**
 * Datos reales del dashboard del organizador (N10): torneos/equipos/jugadores
 * activos, próximos partidos, partidos vencidos sin resultado cargado, y
 * estado del plan (reusa la misma lógica que /api/org/subscription).
 */
export async function getOrgDashboardData(
  organizationId: string,
): Promise<OrgDashboardData> {
  const now = new Date();

  const [
    org,
    subscription,
    effectivePlan,
    activeTournaments,
    teams,
    players,
    upcoming,
    pending,
  ] = await Promise.all([
    db.organization.findUniqueOrThrow({
      where: { id: organizationId },
      select: { id: true, name: true, slug: true },
    }),
    getOrCreateSubscription(organizationId),
    getEffectivePlan(organizationId),
    db.tournament.count({
      where: {
        organizationId,
        deletedAt: null,
        status: { notIn: ["FINALIZADO", "CANCELADO", "ARCHIVADO"] },
      },
    }),
    db.team.count({ where: { organizationId, enabled: true } }),
    db.player.count({ where: { organizationId, deletedAt: null } }),
    db.match.findMany({
      where: {
        tournament: { organizationId, deletedAt: null },
        status: MatchStatus.PROGRAMADO,
        dateTime: { gte: now },
      },
      orderBy: { dateTime: "asc" },
      take: 5,
      include: matchInclude,
    }),
    db.match.findMany({
      where: {
        tournament: { organizationId, deletedAt: null },
        status: {
          in: [
            MatchStatus.PROGRAMADO,
            MatchStatus.EN_JUEGO,
            MatchStatus.ENTRETIEMPO,
          ],
        },
        dateTime: { lt: now },
      },
      orderBy: { dateTime: "asc" },
      take: 10,
      include: matchInclude,
    }),
  ]);

  return {
    organization: org,
    plan: {
      code: effectivePlan.code,
      name: effectivePlan.name,
      status: subscription.status,
      currentPeriodEnd: subscription.currentPeriodEnd,
      maxActiveTournaments: effectivePlan.maxActiveTournaments,
    },
    counts: { activeTournaments, teams, players },
    upcomingMatches: upcoming.map(mapMatch),
    pendingResultMatches: pending.map(mapMatch),
  };
}
