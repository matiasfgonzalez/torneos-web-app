// /app/api/tournament-teams/[id]/route.ts
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireApiOrgAccess } from "@/lib/orgAuth";
import { tournamentTeamUpdateSchema } from "@/lib/validators/tournament-team";
import { validationErrorResponse } from "@/lib/validators/common";
import { apiError, apiNoContent, apiOk } from "@/lib/apiResponse";

type tParams = Promise<{ id: string }>;

export async function PATCH(req: NextRequest, { params }: { params: tParams }) {
  try {
    const { id } = await params;

    if (!id) {
      return apiError(400, "ID no proporcionado");
    }

    const body = await req.json();

    // Verificar si existe la asociación
    const association = await db.tournamentTeam.findUnique({
      where: { id },
      include: { tournament: { select: { organizationId: true } } },
    });

    if (!association) {
      return apiError(404, "Asociación equipo-torneo no encontrada");
    }

    const auth = await requireApiOrgAccess(
      association.tournament.organizationId,
    );
    if (auth.error) {
      return auth.error;
    }

    const parsed = tournamentTeamUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    // Actualizar datos (solo los que vienen en el body)
    const updatedAssociation = await db.tournamentTeam.update({
      where: { id },
      data: parsed.data,
    });

    return apiOk(updatedAssociation);
  } catch (error) {
    console.error("Error al actualizar relación equipo-torneo:", error);
    return apiError(500, "Error al actualizar la relación equipo-torneo");
  }
}

export async function DELETE(req: Request, { params }: { params: tParams }) {
  try {
    const { id } = await params;

    const association = await db.tournamentTeam.findUnique({
      where: { id },
      include: { tournament: { select: { organizationId: true } } },
    });

    if (!association) {
      return apiError(404, "Asociación equipo-torneo no encontrada");
    }

    const auth = await requireApiOrgAccess(
      association.tournament.organizationId,
    );
    if (auth.error) {
      return auth.error;
    }

    await db.tournamentTeam.delete({ where: { id } });

    return apiNoContent(); // A7: éxito sin datos
  } catch (error) {
    console.error("Error eliminando asociación:", error);
    return apiError(500, "Error interno del servidor");
  }
}
