import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
  applyMatchResult,
  extractMatchResult,
} from "@/lib/standings/calculate-standings";
import { validateApiRole } from "@/lib/apiRoleValidation";
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

    // Validate that only ADMINISTRADOR, EDITOR or ORGANIZADOR can update matches
    const authResult = await validateApiRole(["ADMINISTRADOR", "EDITOR", "ORGANIZADOR"]);
    if (authResult.error) {
      return authResult.error;
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
      },
    });

    if (!previousMatch) {
      return NextResponse.json(
        { error: "Partido no encontrado" },
        { status: 404 },
      );
    }

    const body = await req.json();

    const parsed = matchUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    // 📌 Actualizar el partido
    const updatedMatch = await db.match.update({
      where: { id },
      data: parsed.data,
    });

    // 📌 Aplicar cambios a la tabla de posiciones usando cálculo de deltas
    const previousResult = extractMatchResult(previousMatch);
    const newResult = extractMatchResult(updatedMatch);

    await applyMatchResult(previousResult, newResult);

    return NextResponse.json(updatedMatch, { status: 200 });
  } catch (error) {
    console.error("Error en PATCH /api/matches/[id]:", error);
    return NextResponse.json(
      { error: "Error al actualizar el partido" },
      { status: 500 },
    );
  }
}
