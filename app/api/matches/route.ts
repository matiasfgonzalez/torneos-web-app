import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db"; // Asegúrate de tener este cliente configurado
import { MatchStatus } from "@prisma/client";
import {
  applyMatchResult,
  extractMatchResult,
} from "@/lib/standings/calculate-standings";

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
  try {
    const body = await req.json();

    // Validación mínima (puedes mejorar con Zod)
    const {
      dateTime,
      stadium,
      city,
      description,
      status,
      tournamentId,
      homeTeamId,
      awayTeamId,
      phaseId,
      homeScore,
      awayScore,
      penaltyWinnerTeamId,
      penaltyScoreHome,
      penaltyScoreAway,
      roundNumber,
    } = body;

    if (!dateTime || !tournamentId || !homeTeamId || !awayTeamId) {
      return NextResponse.json(
        { error: "Faltan datos requeridos" },
        { status: 400 },
      );
    }

    // Sanitizar campos opcionales de FK - convertir strings vacíos a null
    const sanitizedPhaseId = phaseId || null;
    const sanitizedPenaltyWinnerTeamId = penaltyWinnerTeamId || null;

    const match = await db.match.create({
      data: {
        dateTime: new Date(dateTime),
        stadium: stadium || null,
        city: city || null,
        description: description || null,
        status,
        tournamentId,
        homeTeamId,
        awayTeamId,
        phaseId: sanitizedPhaseId,
        homeScore,
        awayScore,
        penaltyWinnerTeamId: sanitizedPenaltyWinnerTeamId,
        penaltyScoreHome,
        penaltyScoreAway,
        roundNumber,
      },
    });

    // 📌 Si el partido se crea ya FINALIZADO, calcular estadísticas
    if (match.status === MatchStatus.FINALIZADO) {
      const newResult = extractMatchResult(match);
      await applyMatchResult(null, newResult);
    }

    return NextResponse.json(match, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al crear el partido" },
      { status: 500 },
    );
  }
}
