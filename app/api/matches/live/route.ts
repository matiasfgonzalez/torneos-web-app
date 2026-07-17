import { NextResponse } from "next/server";
import { MatchStatus } from "@prisma/client";
import { db } from "@/lib/db";
import type { LiveMatchCard } from "@modules/partidos/utils/liveState";

/**
 * Partidos en vivo ahora mismo (S6) — alimenta el hub "En vivo ahora" de
 * `/partidos`. Solo EN_JUEGO / ENTRETIEMPO, de torneos no eliminados. GET
 * público, `no-store`. Payload chico: nombres, escudos, marcador y minuto.
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
      tournament: { select: { name: true } },
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

  const payload: LiveMatchCard[] = matches.map((m) => {
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
