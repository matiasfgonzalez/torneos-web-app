// /app/api/tournament-teams/[id]/route.ts
import { NextResponse, NextRequest } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

type tParams = Promise<{ id: string }>;

export async function PATCH(req: NextRequest, { params }: { params: tParams }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "ID no proporcionado" },
        { status: 400 }
      );
    }

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

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

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
        { error: "No tienes permisos para actualizar esta asociación" },
        { status: 403 }
      );
    }

    // Verificar si existe la asociación
    const association = await db.tournamentTeam.findUnique({
      where: { id },
    });

    if (!association) {
      return NextResponse.json(
        { error: "Asociación equipo-torneo no encontrada" },
        { status: 404 }
      );
    }

    // Actualizar datos (solo los que vienen en el body)
    const updatedAssociation = await db.tournamentTeam.update({
      where: { id },
      data: {
        group: body.group ?? association.group,
        isEliminated: body.isEliminated ?? association.isEliminated,
        notes: body.notes ?? association.notes,
        matchesPlayed: body.matchesPlayed ?? association.matchesPlayed,
        wins: body.wins ?? association.wins,
        draws: body.draws ?? association.draws,
        losses: body.losses ?? association.losses,
        goalsFor: body.goalsFor ?? association.goalsFor,
        goalsAgainst: body.goalsAgainst ?? association.goalsAgainst,
        goalDifference: body.goalDifference ?? association.goalDifference,
        points: body.points ?? association.points,
      },
    });

    return NextResponse.json(updatedAssociation, { status: 200 });
  } catch (error) {
    console.error("Error al actualizar relación equipo-torneo:", error);
    return NextResponse.json(
      { error: "Error al actualizar la relación equipo-torneo" },
      { status: 500 }
    );
  }
}
