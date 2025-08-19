// /app/api/tournament-teams/route.ts
import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    // Check if user exists
    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Validar que el user sea admin
    const userLogued = await currentUser();
    if (!userLogued) {
      return NextResponse.json(
        { error: "Usuario no autenticado" },
        { status: 401 }
      );
    }
    const role = userLogued.publicMetadata?.role as string | null;
    if (role !== "admin") {
      return NextResponse.json(
        { error: "No tienes permisos para crear un torneo" },
        { status: 403 }
      );
    }

    const {
      tournamentId,
      teamId,
      group,
      isEliminated,
      notes,
      matchesPlayed,
      wins,
      draws,
      losses,
      goalsFor,
      goalsAgainst,
      goalDifference,
      points,
    } = body;

    // Validaciones mínimas
    if (!tournamentId || !teamId) {
      return NextResponse.json(
        { error: "tournamentId y teamId son requeridos" },
        { status: 400 }
      );
    }

    // Crear la relación equipo-torneo
    const tournamentTeam = await db.tournamentTeam.create({
      data: {
        tournamentId,
        teamId,
        group,
        isEliminated,
        notes,
        matchesPlayed: matchesPlayed ?? 0,
        wins: wins ?? 0,
        draws: draws ?? 0,
        losses: losses ?? 0,
        goalsFor: goalsFor ?? 0,
        goalsAgainst: goalsAgainst ?? 0,
        goalDifference: goalDifference ?? 0,
        points: points ?? 0,
      },
    });

    return NextResponse.json(tournamentTeam, { status: 201 });
  } catch (error: any) {
    console.error("Error al crear la relación equipo-torneo:", error);
    return NextResponse.json(
      { error: "Error al crear la relación equipo-torneo" },
      { status: 500 }
    );
  }
}
