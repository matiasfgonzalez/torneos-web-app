import { NextResponse, NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import {
  applyMatchResult,
  extractMatchResult,
} from "@/lib/standings/calculate-standings";

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

    // 🔹 auth en paralelo
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 400 },
      );
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no registrado en la base de datos" },
        { status: 404 },
      );
    }

    if (user.role !== "ADMINISTRADOR") {
      return NextResponse.json(
        { error: "No tienes permisos para actualizar el partido" },
        { status: 403 },
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
      },
    });

    if (!previousMatch) {
      return NextResponse.json(
        { error: "Partido no encontrado" },
        { status: 404 },
      );
    }

    const body = await req.json();

    // Sanitizar campos opcionales de FK - convertir strings vacíos a null
    const sanitizedData = {
      ...body,
      dateTime: new Date(body.dateTime),
      phaseId: body.phaseId || null,
      penaltyWinnerTeamId: body.penaltyWinnerTeamId || null,
      stadium: body.stadium || null,
      city: body.city || null,
      description: body.description || null,
    };

    // 📌 Actualizar el partido
    const updatedMatch = await db.match.update({
      where: { id },
      data: sanitizedData,
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
