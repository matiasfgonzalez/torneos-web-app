import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db"; // Asegúrate de tener este cliente configurado
import { MatchStatus } from "@prisma/client";
import {
  applyMatchResult,
  extractMatchResult,
} from "@/lib/standings/calculate-standings";
import { validateApiRole } from "@/lib/apiRoleValidation";
import { matchCreateSchema } from "@/lib/validators/match";
import { validationErrorResponse } from "@/lib/validators/common";

// GET /api/matches
export async function GET() {
  try {
    const matches = await db.match.findMany({
      include: {
        tournament: true,
        homeTeam: {
          include: { team: true },
        },
        awayTeam: {
          include: { team: true },
        },
        phase: true,
        goals: true,
      },
      orderBy: { dateTime: "asc" },
    });

    return NextResponse.json(matches, { status: 200 });
  } catch (error) {
    console.error("Error fetching matches:", error);
    return NextResponse.json(
      { error: "Error fetching matches" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  // Validate that only ADMINISTRADOR, EDITOR or ORGANIZADOR can create matches
  const authResult = await validateApiRole(["ADMINISTRADOR", "EDITOR", "ORGANIZADOR"]);
  if (authResult.error) {
    return authResult.error;
  }

  try {
    const body = await req.json();

    const parsed = matchCreateSchema.safeParse(body);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    // Regla WALKOVER: requiere marcador cargado (ej. 3-0 al ganador)
    if (
      parsed.data.status === MatchStatus.WALKOVER &&
      (parsed.data.homeScore == null || parsed.data.awayScore == null)
    ) {
      return NextResponse.json(
        {
          error:
            "Un WALKOVER requiere marcador cargado (ej. 3-0 a favor del equipo ganador)",
        },
        { status: 400 },
      );
    }

    // 📌 Crear partido + tabla de posiciones en una única transacción
    // (applyMatchResult no hace nada si el partido no es contable)
    const match = await db.$transaction(async (tx) => {
      const created = await tx.match.create({
        data: parsed.data,
      });

      await applyMatchResult(tx, null, extractMatchResult(created));

      return created;
    });

    return NextResponse.json(match, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al crear el partido" },
      { status: 500 },
    );
  }
}
