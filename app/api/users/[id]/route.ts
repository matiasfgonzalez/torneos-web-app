import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "ID requerido",
          message: "El ID del usuario es requerido",
        },
        { status: 400 }
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
        { status: 404 }
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
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "ID requerido",
          message: "El ID del usuario es requerido",
        },
        { status: 400 }
      );
    }

    const {
      name,
      phone,
      location,
      bio,
      role,
      status,
      imageUrl,
      emailVerified,
    } = body;

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
        { status: 404 }
      );
    }

    // Preparar datos de actualización
    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (location !== undefined) updateData.location = location;
    if (bio !== undefined) updateData.bio = bio;
    if (role !== undefined) updateData.role = role;
    if (status !== undefined) updateData.status = status;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (emailVerified !== undefined) updateData.emailVerified = emailVerified;

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
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "ID requerido",
          message: "El ID del usuario es requerido",
        },
        { status: 400 }
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
        { status: 404 }
      );
    }

    // Realizar eliminación lógica marcando como inactivo
    await db.user.update({
      where: { id },
      data: {
        isActive: false,
        status: "INACTIVE",
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
      { status: 500 }
    );
  }
}
