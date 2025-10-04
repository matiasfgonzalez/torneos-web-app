import { NextResponse, NextRequest } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { MatchStatus } from "@prisma/client";

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

    // 🔹 auth y currentUser en paralelo
    const [{ userId }, userLogued] = await Promise.all([auth(), currentUser()]);

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
        { error: "Usuario no registrado en la base de datos" },
        { status: 404 }
      );
    }

    const role = userLogued?.publicMetadata?.role as string | null;

    if (role !== "admin") {
      return NextResponse.json(
        { error: "No tienes permisos para actualizar el partido" },
        { status: 403 }
      );
    }

    const body = await req.json();

    const updateMatch = await db.match.update({
      where: { id },
      data: {
        ...body,
        dateTime: new Date(body.dateTime),
      },
    });

    if (updateMatch.status === MatchStatus.FINALIZADO) {
      const buildTeamUpdate = (teamScore: number, opponentScore: number) => {
        return {
          matchesPlayed: { increment: 1 },
          wins: { increment: teamScore > opponentScore ? 1 : 0 },
          draws: { increment: teamScore === opponentScore ? 1 : 0 },
          losses: { increment: teamScore < opponentScore ? 1 : 0 },
          goalsFor: { increment: teamScore },
          goalsAgainst: { increment: opponentScore },
          points: {
            increment:
              teamScore > opponentScore
                ? 3
                : teamScore === opponentScore
                ? 1
                : 0,
          },
        };
      };

      await Promise.all([
        db.tournamentTeam.update({
          where: { id: updateMatch.homeTeamId },
          data: buildTeamUpdate(
            updateMatch.homeScore || 0,
            updateMatch.awayScore || 0
          ),
        }),
        db.tournamentTeam.update({
          where: { id: updateMatch.awayTeamId },
          data: buildTeamUpdate(
            updateMatch.awayScore || 0,
            updateMatch.homeScore || 0
          ),
        }),
      ]);
    }

    return NextResponse.json(updateMatch, { status: 200 });
  } catch (error) {
    console.error("Error en PATCH /api/match:", error);
    return NextResponse.json(
      { error: "Error al actualizar el jugador" },
      { status: 500 }
    );
  }
}
