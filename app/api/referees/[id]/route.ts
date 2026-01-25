import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { RefereeStatus } from "@prisma/client";

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
      return NextResponse.json(
        { error: "Árbitro no encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json(referee, { status: 200 });
  } catch (error) {
    console.error("Error al obtener árbitro:", error);
    return NextResponse.json(
      { error: "Error al obtener el árbitro" },
      { status: 500 },
    );
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
    // Verificar autenticación
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Usuario no autenticado" },
        { status: 401 },
      );
    }

    // Verificar usuario en la base de datos
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no registrado en la base de datos" },
        { status: 404 },
      );
    }

    // Verificar permisos de administrador
    if (user.role !== "ADMINISTRADOR") {
      return NextResponse.json(
        { error: "No tienes permisos para actualizar árbitros" },
        { status: 403 },
      );
    }

    // Verificar que el árbitro existe y no está eliminado
    const existingReferee = await db.referee.findUnique({
      where: { id },
    });

    if (!existingReferee) {
      return NextResponse.json(
        { error: "Árbitro no encontrado" },
        { status: 404 },
      );
    }

    if (existingReferee.deletedAt) {
      return NextResponse.json(
        { error: "No se puede actualizar un árbitro eliminado" },
        { status: 400 },
      );
    }

    const body = await req.json();
    const {
      name,
      email,
      phone,
      nationalId,
      birthDate,
      nationality,
      imageUrl,
      certificationLevel,
      status,
      enabled,
    } = body;

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
        return NextResponse.json(
          { error: "Ya existe un árbitro con ese email" },
          { status: 400 },
        );
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
        return NextResponse.json(
          { error: "Ya existe un árbitro con ese DNI" },
          { status: 400 },
        );
      }
    }

    // Validar status si se proporciona
    if (status && !Object.values(RefereeStatus).includes(status)) {
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
    }

    // Construir objeto de actualización
    const updateData: Record<string, unknown> = {};

    if (name !== undefined) updateData.name = name.trim();
    if (email !== undefined) updateData.email = email?.trim() || null;
    if (phone !== undefined) updateData.phone = phone?.trim() || null;
    if (nationalId !== undefined)
      updateData.nationalId = nationalId?.trim() || null;
    if (birthDate !== undefined)
      updateData.birthDate = birthDate ? new Date(birthDate) : null;
    if (nationality !== undefined)
      updateData.nationality = nationality?.trim() || null;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl?.trim() || null;
    if (certificationLevel !== undefined)
      updateData.certificationLevel = certificationLevel?.trim() || null;
    if (status !== undefined) updateData.status = status;
    if (enabled !== undefined) updateData.enabled = enabled;

    const referee = await db.referee.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: { matches: true },
        },
      },
    });

    return NextResponse.json(referee, { status: 200 });
  } catch (error) {
    console.error("Error al actualizar árbitro:", error);
    return NextResponse.json(
      { error: "Error al actualizar el árbitro" },
      { status: 500 },
    );
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
    // Verificar autenticación
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Usuario no autenticado" },
        { status: 401 },
      );
    }

    // Verificar usuario en la base de datos
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no registrado en la base de datos" },
        { status: 404 },
      );
    }

    // Verificar permisos de administrador
    if (user.role !== "ADMINISTRADOR") {
      return NextResponse.json(
        { error: "No tienes permisos para eliminar árbitros" },
        { status: 403 },
      );
    }

    // Verificar que el árbitro existe
    const referee = await db.referee.findUnique({
      where: { id },
      include: {
        _count: {
          select: { matches: true },
        },
      },
    });

    if (!referee) {
      return NextResponse.json(
        { error: "Árbitro no encontrado" },
        { status: 404 },
      );
    }

    const { searchParams } = new URL(req.url);
    const permanent = searchParams.get("permanent") === "true";

    // Verificar si tiene partidos asignados para eliminación física
    if (permanent && referee._count.matches > 0) {
      return NextResponse.json(
        {
          error:
            "No se puede eliminar permanentemente un árbitro con partidos asignados",
          suggestion: "Use eliminación lógica o desasocie los partidos primero",
        },
        { status: 400 },
      );
    }

    if (permanent) {
      // Eliminación física
      await db.referee.delete({
        where: { id },
      });

      return NextResponse.json(
        { message: "Árbitro eliminado permanentemente", name: referee.name },
        { status: 200 },
      );
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

      return NextResponse.json(
        { message: "Árbitro eliminado", name: referee.name },
        { status: 200 },
      );
    }
  } catch (error) {
    console.error("Error al eliminar árbitro:", error);
    return NextResponse.json(
      { error: "Error al eliminar el árbitro" },
      { status: 500 },
    );
  }
}
