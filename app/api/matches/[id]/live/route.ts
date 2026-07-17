import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hasFeature } from "@/lib/planLimits";
import { buildLiveState } from "@modules/partidos/utils/liveState";

/**
 * Estado en vivo de un partido (S6) — payload compacto para el polling de la
 * ficha pública. GET público, `no-store` (el marcador cambia). Solo lo que la
 * cronología necesita, nada de árbitros ni logos (esos ya están en el SSR).
 *
 * Gateado por la feature de plan `liveMatch`: si la liga no la tiene → 403. La
 * ficha ya no pollea en ese caso; esto cierra la URL directa.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const match = await db.match.findUnique({
    where: { id },
    select: {
      status: true,
      homeScore: true,
      awayScore: true,
      homeTeamId: true,
      penaltyWinnerTeamId: true,
      penaltyScoreHome: true,
      penaltyScoreAway: true,
      updatedAt: true,
      tournament: { select: { organizationId: true } },
      goals: {
        select: {
          id: true,
          minute: true,
          isOwnGoal: true,
          isPenalty: true,
          teamPlayer: {
            select: {
              player: { select: { id: true, name: true } },
              tournamentTeam: { select: { id: true } },
            },
          },
          assistTeamPlayer: { select: { player: { select: { name: true } } } },
        },
        orderBy: { minute: "asc" },
      },
      cards: {
        select: {
          id: true,
          minute: true,
          type: true,
          reason: true,
          teamPlayer: {
            select: {
              player: { select: { id: true, name: true } },
              tournamentTeam: { select: { id: true } },
            },
          },
        },
        orderBy: { minute: "asc" },
      },
    },
  });

  if (!match) {
    return NextResponse.json(
      { error: "Partido no encontrado" },
      { status: 404 },
    );
  }

  if (!(await hasFeature(match.tournament.organizationId, "liveMatch"))) {
    return NextResponse.json(
      { error: "El centro en vivo no está disponible en el plan de esta liga." },
      { status: 403 },
    );
  }

  return NextResponse.json(buildLiveState(match), {
    status: 200,
    headers: { "Cache-Control": "no-store" },
  });
}
