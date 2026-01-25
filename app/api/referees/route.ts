import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { RefereeStatus } from "@prisma/client";

/**
 * GET /api/referees
 *
 * Obtiene todos los árbitros del sistema
 *
 * Query params:
 * - includeDisabled: boolean - Incluir árbitros deshabilitados (default: false)
 * - status: RefereeStatus - Filtrar por estado
 *
 * Reglas de negocio:
 * - Por defecto solo retorna árbitros habilitados (enabled = true)
 * - Incluye conteo de partidos dirigidos
 * - Ordenados alfabéticamente por nombre
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const includeDisabled = searchParams.get("includeDisabled") === "true";
    const statusFilter = searchParams.get("status") as RefereeStatus | null;

    const whereClause: Record<string, unknown> = {
      deletedAt: null, // Excluir eliminados lógicamente
    };

    if (!includeDisabled) {
      whereClause.enabled = true;
    }

    if (statusFilter && Object.values(RefereeStatus).includes(statusFilter)) {
      whereClause.status = statusFilter;
    }

    const referees = await db.referee.findMany({
      where: whereClause,
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { matches: true },
        },
      },
    });

    return NextResponse.json(referees, { status: 200 });
  } catch (error) {
    console.error("Error al obtener árbitros:", error);
    return NextResponse.json(
      { error: "Error al obtener los árbitros" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/referees
 *
 * Crea un nuevo árbitro
 *
 * Body:
 * - name: string (requerido)
 * - email?: string
 * - phone?: string
 * - nationalId?: string
 * - birthDate?: string (ISO date)
 * - nationality?: string
 * - imageUrl?: string
 * - certificationLevel?: string
 *
 * Reglas de negocio:
 * - Solo usuarios con rol ADMINISTRADOR pueden crear árbitros
 * - El nombre es obligatorio
 * - El email debe ser único si se proporciona
 * - El DNI debe ser único si se proporciona
 */
export async function POST(req: Request) {
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
        { error: "No tienes permisos para crear árbitros" },
        { status: 403 },
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
    } = body;

    // Validar nombre obligatorio
    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { error: "El nombre es obligatorio" },
        { status: 400 },
      );
    }

    // Validar unicidad de email si se proporciona
    if (email) {
      const existingEmail = await db.referee.findFirst({
        where: { email, deletedAt: null },
      });
      if (existingEmail) {
        return NextResponse.json(
          { error: "Ya existe un árbitro con ese email" },
          { status: 400 },
        );
      }
    }

    // Validar unicidad de DNI si se proporciona
    if (nationalId) {
      const existingNationalId = await db.referee.findFirst({
        where: { nationalId, deletedAt: null },
      });
      if (existingNationalId) {
        return NextResponse.json(
          { error: "Ya existe un árbitro con ese DNI" },
          { status: 400 },
        );
      }
    }

    const referee = await db.referee.create({
      data: {
        name: name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        nationalId: nationalId?.trim() || null,
        birthDate: birthDate ? new Date(birthDate) : null,
        nationality: nationality?.trim() || null,
        imageUrl: imageUrl?.trim() || null,
        certificationLevel: certificationLevel?.trim() || null,
        status: "ACTIVO",
        enabled: true,
      },
      include: {
        _count: {
          select: { matches: true },
        },
      },
    });

    return NextResponse.json(referee, { status: 201 });
  } catch (error) {
    console.error("Error al crear árbitro:", error);
    return NextResponse.json(
      { error: "Error al crear el árbitro" },
      { status: 500 },
    );
  }
}
