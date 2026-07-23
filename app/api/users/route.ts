import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { UserRole, UserStatus } from "@prisma/client";
import { validateApiRole } from "@/lib/apiRoleValidation";

/**
 * No hay `POST` para crear usuarios a mano, a propósito.
 *
 * Las cuentas las crea **Clerk**: la persona se registra, el webhook
 * `user.created` dispara la sincronización con la BD (`checkUser`). Un usuario
 * creado acá con un `clerkUserId` inventado (`temp_…`) jamás podría loguearse
 * —`checkUser` busca por `clerkUserId` real y no lo encontraría— y quedaría
 * como registro huérfano. Para sumar gente a una liga existen las invitaciones
 * de organización (N6). El endpoint de alta manual se eliminó en A4 (2026-07-22).
 */

interface UserFilters {
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  sortBy?: "name" | "email" | "createdAt" | "lastLoginAt";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export async function GET(request: NextRequest) {
  // Validate that only ADMINISTRADOR can access user management
  const authResult = await validateApiRole(["ADMINISTRADOR"]);
  if (authResult.error) {
    return authResult.error;
  }

  try {
    const { searchParams } = new URL(request.url);

    const filters: UserFilters = {
      search: searchParams.get("search") || undefined,
      role: (searchParams.get("role") as UserRole) || undefined,
      status: (searchParams.get("status") as UserStatus) || undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sortBy: (searchParams.get("sortBy") as any) || "createdAt",
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "10"),
    };

    // Construir filtros WHERE
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      isActive: true, // Solo usuarios activos
    };

    // Filtro de búsqueda
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
        { phone: { contains: filters.search, mode: "insensitive" } },
        { location: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    // Filtros específicos
    if (filters.role) {
      where.role = filters.role;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    // Configurar ordenamiento
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orderBy: any = {};
    if (filters.sortBy) {
      orderBy[filters.sortBy] = filters.sortOrder;
    }

    // Calcular paginación
    const skip = ((filters.page || 1) - 1) * (filters.limit || 10);
    const take = filters.limit || 10;

    // Ejecutar consultas
    const [users, totalCount] = await Promise.all([
      db.user.findMany({
        where,
        orderBy,
        skip,
        take,
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
              memberships: true,
            },
          },
        },
      }),
      db.user.count({ where }),
    ]);

    // Calcular metadatos de paginación
    const totalPages = Math.ceil(totalCount / (filters.limit || 10));
    const hasNextPage = (filters.page || 1) < totalPages;
    const hasPreviousPage = (filters.page || 1) > 1;

    return NextResponse.json({
      success: true,
      data: users,
      meta: {
        total: totalCount,
        page: filters.page || 1,
        limit: filters.limit || 10,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
      filters: {
        search: filters.search,
        role: filters.role,
        status: filters.status,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        message: "No se pudieron obtener los usuarios",
      },
      { status: 500 },
    );
  }
}

