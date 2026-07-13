import { db } from "@/lib/db";
import { validateApiRole } from "@/lib/apiRoleValidation";
import { apiError, apiOk } from "@/lib/apiResponse";
import { organizationStatusSchema } from "@/lib/validators/organization";
import { validationErrorResponse } from "@/lib/validators/common";

type tParams = Promise<{ id: string }>;

/**
 * PATCH /api/admin/organizations/[id] — suspender/reactivar una organización
 * (N10). Solo ADMINISTRADOR. No borra ni oculta datos ya cargados: una
 * organización SUSPENDIDA solo pierde la capacidad de crear/mutar recursos
 * (ver requireApiOrgContext en lib/orgAuth.ts).
 */
export async function PATCH(req: Request, { params }: { params: tParams }) {
  const { error } = await validateApiRole(["ADMINISTRADOR"]);
  if (error) return error;

  const { id } = await params;

  const body = await req.json();
  const parsed = organizationStatusSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  try {
    const org = await db.organization.findUnique({ where: { id } });
    if (!org) {
      return apiError(404, "Organización no encontrada");
    }

    const updated = await db.organization.update({
      where: { id },
      data: { status: parsed.data.status },
    });

    return apiOk(updated);
  } catch (err) {
    console.error("Error al actualizar estado de organización:", err);
    return apiError(500, "Error al actualizar la organización");
  }
}
