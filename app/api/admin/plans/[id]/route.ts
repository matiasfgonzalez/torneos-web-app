import { db } from "@/lib/db";
import { validateApiRole } from "@/lib/apiRoleValidation";
import { apiError, apiOk } from "@/lib/apiResponse";
import { planUpdateSchema } from "@/lib/validators/plan";
import { validationErrorResponse } from "@/lib/validators/common";

type tParams = Promise<{ id: string }>;

/**
 * PATCH /api/admin/plans/[id] — editar límites/precio/features o
 * activar/desactivar un plan. Solo ADMINISTRADOR.
 *
 * El plan FREE es el fallback de `getFreePlan()` (lib/planLimits.ts) para
 * toda organización sin suscripción vigente: no se puede desactivar.
 */
export async function PATCH(req: Request, { params }: { params: tParams }) {
  const { error } = await validateApiRole(["ADMINISTRADOR"]);
  if (error) return error;

  const { id } = await params;

  const body = await req.json();
  const parsed = planUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  try {
    const plan = await db.plan.findUnique({ where: { id } });
    if (!plan) {
      return apiError(404, "Plan no encontrado");
    }

    if (plan.code === "FREE" && parsed.data.isActive === false) {
      return apiError(
        400,
        "El plan FREE no se puede desactivar: es el plan de respaldo de toda organización sin suscripción vigente",
      );
    }

    const updated = await db.plan.update({
      where: { id },
      data: parsed.data,
    });
    return apiOk(updated);
  } catch (err) {
    console.error("Error al actualizar plan:", err);
    return apiError(500, "Error al actualizar el plan");
  }
}
