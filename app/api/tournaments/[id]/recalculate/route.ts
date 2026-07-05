import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";
import { recalculateTournamentStandings } from "@/lib/standings/calculate-standings";
import { requireApiOrgAccess } from "@/lib/orgAuth";

type tParams = Promise<{ id: string }>;

/**
 * POST /api/tournaments/[id]/recalculate
 * Recalcula completamente la tabla de posiciones de un torneo desde cero.
 * Solo gestores de la organización dueña (o admin).
 */
export async function POST(req: NextRequest, { params }: { params: tParams }) {
  try {
    const { id: tournamentId } = await params;

    if (!tournamentId) {
      return NextResponse.json(
        { error: "ID de torneo no proporcionado" },
        { status: 400 },
      );
    }

    const tournament = await db.tournament.findFirst({
      where: { id: tournamentId, deletedAt: null },
      select: { id: true, name: true, organizationId: true },
    });

    if (!tournament) {
      return NextResponse.json(
        { error: "Torneo no encontrado" },
        { status: 404 },
      );
    }

    const auth = await requireApiOrgAccess(tournament.organizationId);
    if (auth.error) {
      return auth.error;
    }

    await recalculateTournamentStandings(tournamentId);

    return NextResponse.json(
      {
        success: true,
        message: `Tabla de posiciones recalculada para el torneo "${tournament.name}"`,
        tournamentId,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error en POST /api/tournaments/[id]/recalculate:", error);
    return NextResponse.json(
      { error: "Error al recalcular la tabla de posiciones" },
      { status: 500 },
    );
  }
}
