import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiOrgAccess } from "@/lib/orgAuth";

type tParams = Promise<{ id: string }>;

/**
 * POST /api/tournaments/[id]/restore — deshacer la baja de un torneo (F4).
 *
 * El DELETE de torneo es **soft** (C7): escribe `deletedAt` + `enabled: false`
 * y conserva partidos, goles, tarjetas y standings. Los datos siempre fueron
 * recuperables, pero no había ninguna forma de recuperarlos desde la UI — solo
 * a mano en la base. Esto es lo que hace real al "Deshacer" del toast.
 *
 * Espeja a `restoreReferee` (`modules/arbitros/actions/actions.ts`): revierte
 * los dos campos que escribió el DELETE, nada más.
 */
export async function POST(req: Request, { params }: { params: tParams }) {
  try {
    const { id } = await params;

    const existing = await db.tournament.findUnique({
      where: { id },
      select: { id: true, deletedAt: true, organizationId: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Torneo no encontrado" },
        { status: 404 },
      );
    }

    // Solo gestores de la organización dueña (o admin) pueden restaurar:
    // el mismo control que exige el DELETE.
    const auth = await requireApiOrgAccess(existing.organizationId);
    if (auth.error) {
      return auth.error;
    }

    if (!existing.deletedAt) {
      return NextResponse.json(
        { error: "El torneo no está eliminado" },
        { status: 400 },
      );
    }

    const tournament = await db.tournament.update({
      where: { id },
      data: { deletedAt: null, enabled: true },
    });

    return NextResponse.json(tournament, { status: 200 });
  } catch (error) {
    console.error("Error al restaurar el torneo:", error);
    return NextResponse.json(
      { error: "Error al restaurar el torneo" },
      { status: 500 },
    );
  }
}
