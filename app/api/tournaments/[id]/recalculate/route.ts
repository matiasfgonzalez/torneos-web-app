import { NextResponse, NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { recalculateTournamentStandings } from "@/lib/standings/calculate-standings";

type tParams = Promise<{ id: string }>;

/**
 * POST /api/tournaments/[id]/recalculate
 * Recalcula completamente la tabla de posiciones de un torneo desde cero.
 * Útil para corregir datos corruptos o inconsistentes.
 * Solo accesible por administradores.
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

    // Verificar autenticación
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Usuario no autenticado" },
        { status: 401 },
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

    // Solo administradores pueden recalcular
    if (user.role !== "ADMINISTRADOR") {
      return NextResponse.json(
        { error: "No tienes permisos para recalcular la tabla" },
        { status: 403 },
      );
    }

    // Verificar que el torneo existe
    const tournament = await db.tournament.findUnique({
      where: { id: tournamentId },
      select: { id: true, name: true },
    });

    if (!tournament) {
      return NextResponse.json(
        { error: "Torneo no encontrado" },
        { status: 404 },
      );
    }

    // Recalcular estadísticas
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
