import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiOrgAccess } from "@/lib/orgAuth";
import { assertPlanLimit, isActiveTournamentStatus } from "@/lib/planLimits";

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
      select: { id: true, deletedAt: true, organizationId: true, status: true },
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

    // **Restaurar consume el límite igual que crear.** Un torneo eliminado no
    // cuenta (el conteo filtra `deletedAt: null`), así que sin este chequeo se
    // podía: eliminar un torneo → crear uno nuevo con el cupo liberado →
    // restaurar el eliminado, y terminar con más activos de los que permite el
    // plan. Solo aplica si vuelve a un estado activo: restaurar uno FINALIZADO
    // no ocupa cupo.
    if (isActiveTournamentStatus(existing.status)) {
      const check = await assertPlanLimit(
        existing.organizationId,
        "createTournament",
      );
      if (!check.ok) {
        return NextResponse.json(
          {
            error: `${check.error} (el torneo sigue eliminado: podés archivar otro y volver a restaurarlo)`,
          },
          { status: 402 },
        );
      }
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
