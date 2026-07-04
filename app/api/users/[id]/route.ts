import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateApiRole, canManageUserApi } from "@/lib/apiRoleValidation";
import { userUpdateSchema } from "@/lib/validators/user";
import { validationErrorResponse } from "@/lib/validators/common";

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
      return NextResponse.json(
        {
          success: false,
          error: "ID requerido",
          message: "El ID del usuario es requerido",
        },
        { status: 400 },
      );
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
            tournaments: true,
            teams: true,
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
            publishedAt: "desc",
          },
          take: 5,
        },
        // Incluir los últimos torneos
        tournaments: {
          select: {
            id: true,
            name: true,
            status: true,
            startDate: true,
            category: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
        },
        // Incluir los últimos equipos
        teams: {
          select: {
            id: true,
            name: true,
            shortName: true,
            enabled: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
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
      return NextResponse.json(
        {
          success: false,
          error: "Usuario no encontrado",
          message: "No se encontró el usuario especificado",
        },
        { status: 404 },
      );
    }

    // Calcular estadísticas adicionales
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [recentNews, recentTournaments, recentActivity] = await Promise.all([
      db.news.count({
        where: {
          userId: id,
          publishedAt: { gte: thirtyDaysAgo },
        },
      }),
      db.tournament.count({
        where: {
          userId: id,
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      db.auditLog.count({
        where: {
          userId: id,
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
    ]);

    // Formatear la respuesta con estadísticas adicionales
    const userWithStats = {
      ...user,
      stats: {
        recent: {
          news: recentNews,
          tournaments: recentTournaments,
          activity: recentActivity,
        },
        total: {
          news: user._count.news,
          tournaments: user._count.tournaments,
          teams: user._count.teams,
          auditLogs: user._count.auditLogs,
        },
      },
    };

    return NextResponse.json({
      success: true,
      data: userWithStats,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        message: "No se pudo obtener el usuario",
      },
      { status: 500 },
    );
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
      return NextResponse.json(
        {
          success: false,
          error: "ID requerido",
          message: "El ID del usuario es requerido",
        },
        { status: 400 },
      );
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
      return NextResponse.json(
        {
          success: false,
          error: "Usuario no encontrado",
          message: "No se encontró el usuario especificado",
        },
        { status: 404 },
      );
    }

    // Validate role hierarchy - cannot modify users of equal or higher rank
    if (!canManageUserApi(authResult.user!.role, existingUser.role)) {
      return NextResponse.json(
        {
          success: false,
          error: "Permisos insuficientes",
          message: "No puedes modificar usuarios de igual o mayor jerarquía",
        },
        { status: 403 }
      );
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

    // Crear log de auditoría
    await db.auditLog.create({
      data: {
        userId: id,
        action: "UPDATE_USER",
        entity: "User",
        entityId: id,
        payload: updateData,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: "Usuario actualizado exitosamente",
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        message: "No se pudo actualizar el usuario",
      },
      { status: 500 },
    );
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
      return NextResponse.json(
        {
          success: false,
          error: "ID requerido",
          message: "El ID del usuario es requerido",
        },
        { status: 400 },
      );
    }

    // Verificar que el usuario existe
    const existingUser = await db.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "Usuario no encontrado",
          message: "No se encontró el usuario especificado",
        },
        { status: 404 },
      );
    }

    // Validate role hierarchy - cannot delete users of equal or higher rank
    if (!canManageUserApi(authResult.user!.role, existingUser.role)) {
      return NextResponse.json(
        {
          success: false,
          error: "Permisos insuficientes",
          message: "No puedes eliminar usuarios de igual o mayor jerarquía",
        },
        { status: 403 }
      );
    }

    // Realizar eliminación lógica marcando como inactivo
    await db.user.update({
      where: { id },
      data: {
        isActive: false,
        status: "INACTIVO",
      },
    });

    // Crear log de auditoría
    await db.auditLog.create({
      data: {
        userId: id,
        action: "DELETE_USER",
        entity: "User",
        entityId: id,
        payload: { reason: "Admin deletion" },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Usuario eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        message: "No se pudo eliminar el usuario",
      },
      { status: 500 },
    );
  }
}
