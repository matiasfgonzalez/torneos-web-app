import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiOrgAccess } from "@/lib/orgAuth";

type tParams = Promise<{ id: string }>;

export async function GET(req: Request, { params }: { params: tParams }) {
  const { id } = await params;

  try {
    const players = await db.teamPlayer.findMany({
      where: {
        tournamentTeamId: id,
      },
      include: {
        player: true,
      },
      orderBy: { joinedAt: "asc" },
    });

    return NextResponse.json(players, { status: 200 });
  } catch (error) {
    console.error("Error al obtener los jugadores asociados: ", error);
    return NextResponse.json(
      { error: "Error al obtener los jugadores asociados:" },
      { status: 500 },
    );
  }
}

/**
 * DELETE - Desasociar un jugador de un equipo
 *
 * Reglas de negocio:
 * - Solo usuarios con rol ADMINISTRADOR pueden desasociar jugadores
 * - El registro de TeamPlayer debe existir
 * - Se eliminan también los goles y tarjetas asociados a ese jugador en ese equipo
 *   (por la configuración onDelete: Cascade en el schema)
 */
export async function DELETE(req: Request, { params }: { params: tParams }) {
  const { id } = await params; // id es el ID del registro TeamPlayer

  try {
    // Verificar que el registro existe
    const teamPlayer = await db.teamPlayer.findUnique({
      where: { id },
      include: {
        player: true,
        tournamentTeam: {
          include: {
            team: true,
            tournament: true,
          },
        },
      },
    });

    if (!teamPlayer) {
      return NextResponse.json(
        { error: "La asociación jugador-equipo no existe" },
        { status: 404 },
      );
    }

    const auth = await requireApiOrgAccess(
      teamPlayer.tournamentTeam.tournament.organizationId,
    );
    if (auth.error) {
      return auth.error;
    }

    // Eliminar la asociación (los goles y tarjetas se eliminan por cascade)
    await db.teamPlayer.delete({
      where: { id },
    });

    return NextResponse.json(
      {
        message: "Jugador desasociado correctamente",
        deletedPlayer: teamPlayer.player.name,
        team: teamPlayer.tournamentTeam.team.name,
        tournament: teamPlayer.tournamentTeam.tournament.name,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error al desasociar el jugador:", error);
    return NextResponse.json(
      { error: "Error al desasociar el jugador del equipo" },
      { status: 500 },
    );
  }
}
