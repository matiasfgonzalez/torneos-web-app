import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { validateApiRole, canManageUserApi } from "@/lib/apiRoleValidation";
import { formatTournamentCategory } from "@/lib/constants";
import { userUpdateSchema } from "@/lib/validators/user";
import { validationErrorResponse } from "@/lib/validators/common";
import { logAudit, AuditAction, AuditEntity } from "@/lib/audit";
import { apiError, apiNoContent, apiOk } from "@/lib/apiResponse";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // Validate that only ADMINISTRADOR can access user details
  const authResult = await validateApiRole(["ADMINISTRADOR"]);
  if (authResult.error) {
    return authResult.error;
  }

  try {
    const { id } = await params;

    if (!id) {
      return apiError(400, "El ID del usuario es requerido");
    }

    // Obtener usuario con relaciones y estadísticas
    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        imageUrl: true,
        phone: true,
        location: true,
        bio: true,
        role: true,
        status: true,
        lastLoginAt: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            news: true,
            auditLogs: true,
          },
        },
        // Incluir las últimas noticias
        news: {
          select: {
            id: true,
            title: true,
            summary: true,
            published: true,
            publishedAt: true,
          },
          orderBy: {
            // Nullable desde A6 (borradores sin fecha): que no encabecen.
            publishedAt: { sort: "desc", nulls: "last" },
          },
          take: 5,
        },
        // Membresías de organización (reemplaza tournaments/teams directos)
        memberships: {
          select: {
            role: true,
            organizationId: true,
            organization: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
        // Incluir los últimos logs de auditoría
        auditLogs: {
          select: {
            id: true,
            action: true,
            entity: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        },
      },
    });

    if (!user) {
      return apiError(404, "No se encontró el usuario especificado");
    }

    // Calcular estadísticas adicionales (torneos/equipos vía organizaciones)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const orgIds = user.memberships.map((m) => m.organizationId);
    const orgFilter = { organizationId: { in: orgIds }, deletedAt: null };

    const [
      recentNews,
      recentTournaments,
      recentActivity,
      tournaments,
      tournamentsTotal,
      teamsTotal,
    ] = await Promise.all([
      // Noticias PUBLICADAS en los últimos 30 días. Desde A6 un borrador tiene
      // `publishedAt: null`, así que ya no se cuela en la métrica.
      db.news.count({
        where: {
          userId: id,
          published: true,
          publishedAt: { gte: thirtyDaysAgo },
        },
      }),
      db.tournament.count({
        where: { ...orgFilter, createdAt: { gte: thirtyDaysAgo } },
      }),
      db.auditLog.count({
        where: {
          userId: id,
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      db.tournament.findMany({
        where: orgFilter,
        select: {
          id: true,
          name: true,
          status: true,
          startDate: true,
          ageGroup: true,
          gender: true,
          division: true,
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      db.tournament.count({ where: orgFilter }),
      db.team.count({ where: orgFilter }),
    ]);

    // Formatear la respuesta con estadísticas adicionales
    const userWithStats = {
      ...user,
      tournaments: tournaments.map((t) => ({
        ...t,
        category: formatTournamentCategory(t),
      })),
      teams: [] as { id: string; name: string }[],
      stats: {
        recent: {
          news: recentNews,
          tournaments: recentTournaments,
          activity: recentActivity,
        },
        total: {
          news: user._count.news,
          tournaments: tournamentsTotal,
          teams: teamsTotal,
          auditLogs: user._count.auditLogs,
        },
      },
    };

    // A7: el dato directo. El `success: true` lo dice el status HTTP.
    return apiOk(userWithStats);
  } catch (error) {
    console.error("Error fetching user:", error);
    return apiError(500, "No se pudo obtener el usuario");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // Validate that only ADMINISTRADOR can update users
  const authResult = await validateApiRole(["ADMINISTRADOR"]);
  if (authResult.error) {
    return authResult.error;
  }

  try {
    const { id } = await params;
    const body = await request.json();

    if (!id) {
      return apiError(400, "El ID del usuario es requerido");
    }

    const parsed = userUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    // Verificar que el usuario existe
    const existingUser = await db.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return apiError(404, "No se encontró el usuario especificado");
    }

    // Validate role hierarchy - cannot modify users of equal or higher rank
    if (!canManageUserApi(authResult.user!.role, existingUser.role)) {
      return apiError(403, "No puedes modificar usuarios de igual o mayor jerarquía");
    }

    const updateData = parsed.data;

    // Actualizar el usuario
    const updatedUser = await db.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        imageUrl: true,
        phone: true,
        location: true,
        bio: true,
        role: true,
        status: true,
        lastLoginAt: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Auditoría (M8): el actor es el ADMIN que edita, no el usuario editado.
    // Si el cambio incluye el rol, se marca como ROLE_CHANGE (la mutación
    // sensible que pide el enunciado).
    await logAudit({
      actorId: authResult.user!.id,
      action:
        "role" in updateData ? AuditAction.ROLE_CHANGE : AuditAction.UPDATE,
      entity: AuditEntity.USER,
      entityId: id,
      payload: updateData,
    });

    // A7: el usuario actualizado, sin `message`: el copy del toast lo pone la
    // pantalla, que es la que sabe en qué contexto se hizo el cambio.
    return apiOk(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return apiError(500, "No se pudo actualizar el usuario");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // Validate that only ADMINISTRADOR can delete users
  const authResult = await validateApiRole(["ADMINISTRADOR"]);
  if (authResult.error) {
    return authResult.error;
  }

  try {
    const { id } = await params;

    if (!id) {
      return apiError(400, "El ID del usuario es requerido");
    }

    // Verificar que el usuario existe
    const existingUser = await db.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return apiError(404, "No se encontró el usuario especificado");
    }

    // Validate role hierarchy - cannot delete users of equal or higher rank
    if (!canManageUserApi(authResult.user!.role, existingUser.role)) {
      return apiError(403, "No puedes eliminar usuarios de igual o mayor jerarquía");
    }

    // Realizar eliminación lógica marcando como inactivo
    await db.user.update({
      where: { id },
      data: {
        isActive: false,
        status: "INACTIVO",
      },
    });

    // Auditoría (M8): actor = admin que da de baja.
    await logAudit({
      actorId: authResult.user!.id,
      action: AuditAction.DELETE,
      entity: AuditEntity.USER,
      entityId: id,
      payload: { reason: "Baja lógica desde el panel" },
    });

    // A7: un DELETE sin datos que devolver responde 204 (sin cuerpo). El
    // cliente ya lo contempla: `api-client` no intenta parsear un body vacío.
    return apiNoContent();
  } catch (error) {
    console.error("Error deleting user:", error);
    return apiError(500, "No se pudo eliminar el usuario");
  }
}
