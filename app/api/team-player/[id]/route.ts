import { db } from "@/lib/db";
import { requireApiOrgAccess } from "@/lib/orgAuth";
import { apiError, apiOk } from "@/lib/apiResponse";

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

    return apiOk(players);
  } catch (error) {
    console.error("Error al obtener los jugadores asociados: ", error);
    return apiError(500, "Error al obtener los jugadores asociados:");
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
      return apiError(404, "La asociación jugador-equipo no existe");
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

    return apiOk({
        message: "Jugador desasociado correctamente",
        deletedPlayer: teamPlayer.player.name,
        team: teamPlayer.tournamentTeam.team.name,
        tournament: teamPlayer.tournamentTeam.tournament.name,
      });
  } catch (error) {
    console.error("Error al desasociar el jugador:", error);
    return apiError(500, "Error al desasociar el jugador del equipo");
  }
}
