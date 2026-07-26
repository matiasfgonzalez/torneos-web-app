import { db } from "@/lib/db";
import { requireApiOrgAccess } from "@/lib/orgAuth";
import { refereeUpdateSchema } from "@/lib/validators/referee";
import { validationErrorResponse } from "@/lib/validators/common";
import { apiError, apiNoContent, apiOk } from "@/lib/apiResponse";

type tParams = Promise<{ id: string }>;

/**
 * GET /api/referees/[id]
 *
 * Obtiene un árbitro específico por ID
 *
 * Incluye:
 * - Datos del árbitro
 * - Conteo de partidos dirigidos
 * - Historial de partidos (últimos 10)
 */
export async function GET(req: Request, { params }: { params: tParams }) {
  const { id } = await params;

  try {
    // El árbitro incluye PII (email, teléfono, DNI): solo miembros de la
    // organización dueña pueden leerlo (M1). Se resuelve la org con una
    // consulta liviana antes de exponer el detalle.
    const owner = await db.referee.findUnique({
      where: { id },
      select: { organizationId: true },
    });
    if (!owner) {
      return apiError(404, "Árbitro no encontrado");
    }
    const auth = await requireApiOrgAccess(owner.organizationId, {
      allowCollaborator: true,
    });
    if (auth.error) {
      return auth.error;
    }

    const referee = await db.referee.findUnique({
      where: { id },
      include: {
        _count: {
          select: { matches: true },
        },
        matches: {
          take: 10,
          orderBy: {
            match: {
              dateTime: "desc",
            },
          },
          include: {
            match: {
              include: {
                tournament: {
                  select: { id: true, name: true },
                },
                homeTeam: {
                  include: {
                    team: { select: { id: true, name: true, logoUrl: true } },
                  },
                },
                awayTeam: {
                  include: {
                    team: { select: { id: true, name: true, logoUrl: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!referee) {
      return apiError(404, "Árbitro no encontrado");
    }

    return apiOk(referee);
  } catch (error) {
    console.error("Error al obtener árbitro:", error);
    return apiError(500, "Error al obtener el árbitro");
  }
}

/**
 * PATCH /api/referees/[id]
 *
 * Actualiza un árbitro existente
 *
 * Body (todos opcionales):
 * - name: string
 * - email: string
 * - phone: string
 * - nationalId: string
 * - birthDate: string (ISO date)
 * - nationality: string
 * - imageUrl: string
 * - certificationLevel: string
 * - status: RefereeStatus
 * - enabled: boolean
 *
 * Reglas de negocio:
 * - Solo usuarios con rol ADMINISTRADOR pueden actualizar árbitros
 * - El email debe ser único si se cambia
 * - El DNI debe ser único si se cambia
 * - No se puede actualizar un árbitro eliminado lógicamente
 */
export async function PATCH(req: Request, { params }: { params: tParams }) {
  const { id } = await params;

  try {
    // Verificar que el árbitro existe y no está eliminado
    const existingReferee = await db.referee.findUnique({
      where: { id },
    });

    if (!existingReferee) {
      return apiError(404, "Árbitro no encontrado");
    }

    const auth = await requireApiOrgAccess(existingReferee.organizationId);
    if (auth.error) {
      return auth.error;
    }

    if (existingReferee.deletedAt) {
      return apiError(400, "No se puede actualizar un árbitro eliminado");
    }

    const body = await req.json();

    const parsed = refereeUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    const { email, nationalId } = parsed.data;

    // Validar unicidad de email si se cambia
    if (email && email !== existingReferee.email) {
      const existingEmail = await db.referee.findFirst({
        where: {
          email,
          deletedAt: null,
          NOT: { id },
        },
      });
      if (existingEmail) {
        return apiError(400, "Ya existe un árbitro con ese email");
      }
    }

    // Validar unicidad de DNI si se cambia
    if (nationalId && nationalId !== existingReferee.nationalId) {
      const existingNationalId = await db.referee.findFirst({
        where: {
          nationalId,
          deletedAt: null,
          NOT: { id },
        },
      });
      if (existingNationalId) {
        return apiError(400, "Ya existe un árbitro con ese DNI");
      }
    }

    const referee = await db.referee.update({
      where: { id },
      data: parsed.data,
      include: {
        _count: {
          select: { matches: true },
        },
      },
    });

    return apiOk(referee);
  } catch (error) {
    console.error("Error al actualizar árbitro:", error);
    return apiError(500, "Error al actualizar el árbitro");
  }
}

/**
 * DELETE /api/referees/[id]
 *
 * Elimina un árbitro (eliminación lógica o física)
 *
 * Query params:
 * - permanent: boolean - Si es true, elimina físicamente (default: false = lógica)
 *
 * Reglas de negocio:
 * - Solo usuarios con rol ADMINISTRADOR pueden eliminar árbitros
 * - Por defecto realiza eliminación lógica (soft delete)
 * - Si el árbitro tiene partidos asignados, solo se permite eliminación lógica
 * - La eliminación física solo es posible si no tiene partidos asignados
 */
export async function DELETE(req: Request, { params }: { params: tParams }) {
  const { id } = await params;

  try {
    // Verificar que el árbitro existe
    const referee = await db.referee.findUnique({
      where: { id },
      include: {
        _count: {
          select: { matches: true },
        },
      },
    });

    if (referee) {
      const auth = await requireApiOrgAccess(referee.organizationId);
      if (auth.error) {
        return auth.error;
      }
    }

    if (!referee) {
      return apiError(404, "Árbitro no encontrado");
    }

    const { searchParams } = new URL(req.url);
    const permanent = searchParams.get("permanent") === "true";

    // Verificar si tiene partidos asignados para eliminación física
    if (permanent && referee._count.matches > 0) {
      return apiOk({
          error:
            "No se puede eliminar permanentemente un árbitro con partidos asignados",
          suggestion: "Use eliminación lógica o desasocie los partidos primero",
        }, 400);
    }

    if (permanent) {
      // Eliminación física
      await db.referee.delete({
        where: { id },
      });

      return apiNoContent(); // A7: éxito sin datos (baja definitiva)
    } else {
      // Eliminación lógica (soft delete)
      await db.referee.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          enabled: false,
          status: "INACTIVO",
        },
      });

      return apiNoContent(); // A7: éxito sin datos (baja lógica)
    }
  } catch (error) {
    console.error("Error al eliminar árbitro:", error);
    return apiError(500, "Error al eliminar el árbitro");
  }
}
