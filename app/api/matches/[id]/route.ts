import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
  applyMatchResult,
  extractMatchResult,
} from "@/lib/standings/calculate-standings";
import { resolveWalkover } from "@/lib/standings/walkover";
import { requireApiOrgAccess } from "@/lib/orgAuth";
import { matchUpdateSchema } from "@/lib/validators/match";
import { validationErrorResponse } from "@/lib/validators/common";

type tParams = Promise<{ id: string }>;

export async function PATCH(req: NextRequest, { params }: { params: tParams }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "ID no proporcionado" },
        { status: 400 },
      );
    }

    // 📌 Obtener estado anterior del partido ANTES de actualizar
    // (incluye la config deportiva del torneo: puntos + walkoverScore, N7)
    const previousMatch = await db.match.findUnique({
      where: { id },
      select: {
        homeTeamId: true,
        awayTeamId: true,
        homeScore: true,
        awayScore: true,
        status: true,
        tournamentPhaseId: true,
        walkoverWinnerTeamId: true,
        tournament: {
          select: {
            organizationId: true,
            pointsWin: true,
            pointsDraw: true,
            pointsLoss: true,
            walkoverScore: true,
          },
        },
      },
    });

    if (!previousMatch) {
      return NextResponse.json(
        { error: "Partido no encontrado" },
        { status: 404 },
      );
    }

    // Carga de resultados: COLABORADOR también puede
    const auth = await requireApiOrgAccess(
      previousMatch.tournament.organizationId,
      { allowCollaborator: true },
    );
    if (auth.error) {
      return auth.error;
    }

    const body = await req.json();

    const parsed = matchUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    const data = { ...parsed.data };

    // Regla WALKOVER (N7): el organizador marca el ganador y el server fija
    // el marcador (walkoverScore-0). Se usan los valores efectivos porque el
    // update puede no reenviar equipos ni ganador.
    const effectiveStatus = data.status ?? previousMatch.status;
    if (effectiveStatus === "WALKOVER") {
      const wo = resolveWalkover({
        status: effectiveStatus,
        walkoverWinnerTeamId:
          data.walkoverWinnerTeamId ?? previousMatch.walkoverWinnerTeamId,
        homeTeamId: data.homeTeamId ?? previousMatch.homeTeamId,
        awayTeamId: data.awayTeamId ?? previousMatch.awayTeamId,
        walkoverScore: previousMatch.tournament.walkoverScore,
      });
      if (!wo.ok) {
        return NextResponse.json({ error: wo.error }, { status: 400 });
      }
      data.homeScore = wo.homeScore;
      data.awayScore = wo.awayScore;
    }

    // 📌 Actualizar partido + tabla de posiciones en una única transacción
    const updatedMatch = await db.$transaction(async (tx) => {
      const updated = await tx.match.update({
        where: { id },
        data,
      });

      await applyMatchResult(
        tx,
        extractMatchResult(previousMatch),
        extractMatchResult(updated),
        {
          pointsWin: previousMatch.tournament.pointsWin,
          pointsDraw: previousMatch.tournament.pointsDraw,
          pointsLoss: previousMatch.tournament.pointsLoss,
        },
      );

      return updated;
    });

    return NextResponse.json(updatedMatch, { status: 200 });
  } catch (error) {
    console.error("Error en PATCH /api/matches/[id]:", error);
    return NextResponse.json(
      { error: "Error al actualizar el partido" },
      { status: 500 },
    );
  }
}
