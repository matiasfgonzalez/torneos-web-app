// /app/api/tournament-teams/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { tournamentTeamCreateSchema } from "@/lib/validators/tournament-team";
import { validationErrorResponse } from "@/lib/validators/common";

export async function POST(req: Request) {
  try {
    const body = await req.json();

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

    // Check if user exists
    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 },
      );
    }

    // Validar que el user sea admin
    if (user.role !== "ADMINISTRADOR") {
      return NextResponse.json(
        { error: "No tienes permisos para gestionar equipos en torneos" },
        { status: 403 },
      );
    }

    const parsed = tournamentTeamCreateSchema.safeParse(body);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    // Crear la relación equipo-torneo
    const tournamentTeam = await db.tournamentTeam.create({
      data: parsed.data,
    });

    return NextResponse.json(tournamentTeam, { status: 201 });
  } catch (error) {
    console.error("Error al crear la relación equipo-torneo:", error);
    return NextResponse.json(
      { error: "Error al crear la relación equipo-torneo" },
      { status: 500 },
    );
  }
}
