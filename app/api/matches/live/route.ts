import { NextResponse } from "next/server";
import { MatchStatus } from "@prisma/client";
import { db } from "@/lib/db";
import type { LiveMatchCard } from "@modules/partidos/utils/liveState";

/**
 * Organizaciones (de las pasadas) cuyo plan EFECTIVO incluye `liveMatch`.
 * Lectura pura, sin efectos: una org sin suscripción, vencida o cancelada
 * cae a FREE (sin live) y no entra al set. No usa `hasFeature` porque este
 * endpoint es público y toca muchas orgs — no queremos crear suscripciones
 * FREE como efecto de que un hincha mire `/partidos`.
 */
async function orgsWithLiveMatch(orgIds: string[]): Promise<Set<string>> {
  if (orgIds.length === 0) return new Set();

  const subs = await db.subscription.findMany({
    where: { organizationId: { in: orgIds } },
    select: {
      organizationId: true,
      status: true,
      currentPeriodEnd: true,
      plan: { select: { features: true } },
    },
  });

  const now = new Date();
  const enabled = new Set<string>();
  for (const s of subs) {
    const active =
      s.status === "ACTIVA" &&
      (s.currentPeriodEnd === null || s.currentPeriodEnd >= now);
    const features = s.plan.features as Record<string, boolean> | null;
    if (active && features?.liveMatch === true) enabled.add(s.organizationId);
  }
  return enabled;
}

/**
 * Partidos en vivo ahora mismo (S6) — alimenta el hub "En vivo ahora" de
 * `/partidos`. Solo EN_JUEGO / ENTRETIEMPO, de torneos no eliminados y de
 * ligas cuyo plan incluye el centro en vivo (`liveMatch`). GET público,
 * `no-store`. Payload chico: nombres, escudos, marcador y minuto.
 */
export async function GET() {
  const matches = await db.match.findMany({
    where: {
      status: { in: [MatchStatus.EN_JUEGO, MatchStatus.ENTRETIEMPO] },
      tournament: { deletedAt: null },
    },
    select: {
      id: true,
      status: true,
      homeScore: true,
      awayScore: true,
      dateTime: true,
      tournament: { select: { name: true, organizationId: true } },
      homeTeam: {
        select: {
          team: { select: { name: true, shortName: true, logoUrl: true } },
        },
      },
      awayTeam: {
        select: {
          team: { select: { name: true, shortName: true, logoUrl: true } },
        },
      },
      goals: { select: { minute: true } },
      cards: { select: { minute: true } },
    },
    orderBy: { dateTime: "asc" },
  });

  // Gate de plan: solo las ligas con `liveMatch` aparecen en el hub.
  const enabledOrgs = await orgsWithLiveMatch([
    ...new Set(matches.map((m) => m.tournament.organizationId)),
  ]);
  const liveMatches = matches.filter((m) =>
    enabledOrgs.has(m.tournament.organizationId),
  );

  const payload: LiveMatchCard[] = liveMatches.map((m) => {
    const minutes = [...m.goals, ...m.cards]
      .map((e) => e.minute)
      .filter((min): min is number => min != null);
    return {
      id: m.id,
      status: m.status,
      homeScore: m.homeScore,
      awayScore: m.awayScore,
      currentMinute: minutes.length ? Math.max(...minutes) : null,
      home: {
        name: m.homeTeam.team.name,
        shortName: m.homeTeam.team.shortName,
        logoUrl: m.homeTeam.team.logoUrl,
      },
      away: {
        name: m.awayTeam.team.name,
        shortName: m.awayTeam.team.shortName,
        logoUrl: m.awayTeam.team.logoUrl,
      },
      tournamentName: m.tournament.name,
    };
  });

  return NextResponse.json(payload, {
    status: 200,
    headers: { "Cache-Control": "no-store" },
  });
}
