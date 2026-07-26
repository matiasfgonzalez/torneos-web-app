import { db } from "@/lib/db";
import { requireApiOrgOwner } from "@/lib/orgAuth";
import { assertPlanLimit, isActiveTournamentStatus } from "@/lib/planLimits";
import { logAudit, AuditAction, AuditEntity } from "@/lib/audit";
import { apiError, apiOk } from "@/lib/apiResponse";

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
      return apiError(404, "Torneo no encontrado");
    }

    // Solo el OWNER (o admin) restaura: el mismo control que exige el DELETE
    // (D12/N14c — restaurar puede volver a ocupar cupo del plan).
    const auth = await requireApiOrgOwner(
      existing.organizationId,
      "Solo el dueño de la liga puede restaurar torneos",
    );
    if (auth.error) {
      return auth.error;
    }

    if (!existing.deletedAt) {
      return apiError(400, "El torneo no está eliminado");
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
        return apiOk({
            error: `${check.error} (el torneo sigue eliminado: podés archivar otro y volver a restaurarlo)`,
          }, 402);
      }
    }

    const tournament = await db.tournament.update({
      where: { id },
      data: { deletedAt: null, enabled: true },
    });

    // Auditoría (M8): restauración de torneo (vuelve a consumir cupo).
    await logAudit({
      actorId: auth.user.id,
      action: AuditAction.RESTORE,
      entity: AuditEntity.TOURNAMENT,
      entityId: id,
      payload: { name: tournament.name },
    });

    return apiOk(tournament);
  } catch (error) {
    console.error("Error al restaurar el torneo:", error);
    return apiError(500, "Error al restaurar el torneo");
  }
}
