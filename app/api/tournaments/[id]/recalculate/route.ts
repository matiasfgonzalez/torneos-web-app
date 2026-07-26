import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { recalculateTournamentStandings } from "@/lib/standings/calculate-standings";
import { requireApiOrgAccess } from "@/lib/orgAuth";
import { apiError, apiOk } from "@/lib/apiResponse";

type tParams = Promise<{ id: string }>;

/**
 * POST /api/tournaments/[id]/recalculate
 * Recalcula completamente la tabla de posiciones de un torneo desde cero.
 * Solo gestores de la organización dueña (o admin).
 *
 * ⚠️ **Hoy no la llama ninguna pantalla** (ver TODO #23): la tabla se recalcula
 * sola al guardar un resultado. Queda como herramienta de reparación manual.
 */
export async function POST(req: NextRequest, { params }: { params: tParams }) {
  try {
    const { id: tournamentId } = await params;

    if (!tournamentId) {
      return apiError(400, "ID de torneo no proporcionado");
    }

    const tournament = await db.tournament.findFirst({
      where: { id: tournamentId, deletedAt: null },
      select: { id: true, name: true, organizationId: true },
    });

    if (!tournament) {
      return apiError(404, "Torneo no encontrado");
    }

    const auth = await requireApiOrgAccess(tournament.organizationId);
    if (auth.error) {
      return auth.error;
    }

    await recalculateTournamentStandings(tournamentId);

    // A7: el dato directo. El `success: true` lo dice el status, y el copy del
    // toast lo escribe la pantalla que llame — hoy ninguna (ver el aviso arriba).
    return apiOk({ tournamentId, name: tournament.name });
  } catch (error) {
    console.error("Error en POST /api/tournaments/[id]/recalculate:", error);
    return apiError(500, "Error al recalcular la tabla de posiciones");
  }
}
