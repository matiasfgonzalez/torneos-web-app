import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
  applyMatchResult,
  extractMatchResult,
} from "@/lib/standings/calculate-standings";
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
    const previousMatch = await db.match.findUnique({
      where: { id },
      select: {
        homeTeamId: true,
        awayTeamId: true,
        homeScore: true,
        awayScore: true,
        status: true,
        tournamentPhaseId: true,
        tournament: { select: { organizationId: true } },
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

    // Regla WALKOVER: computa como partido finalizado, requiere marcador
    // cargado (ej. 3-0 al ganador según decisión de negocio)
    const effectiveStatus = parsed.data.status ?? previousMatch.status;
    const effectiveHomeScore =
      parsed.data.homeScore === undefined
        ? previousMatch.homeScore
        : parsed.data.homeScore;
    const effectiveAwayScore =
      parsed.data.awayScore === undefined
        ? previousMatch.awayScore
        : parsed.data.awayScore;

    if (
      effectiveStatus === "WALKOVER" &&
      (effectiveHomeScore === null || effectiveAwayScore === null)
    ) {
      return NextResponse.json(
        {
          error:
            "Un WALKOVER requiere marcador cargado (ej. 3-0 a favor del equipo ganador)",
        },
        { status: 400 },
      );
    }

    // 📌 Actualizar partido + tabla de posiciones en una única transacción
    const updatedMatch = await db.$transaction(async (tx) => {
      const updated = await tx.match.update({
        where: { id },
        data: parsed.data,
      });

      await applyMatchResult(
        tx,
        extractMatchResult(previousMatch),
        extractMatchResult(updated),
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
