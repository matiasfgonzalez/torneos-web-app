"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { RefereeStatus } from "@prisma/client";
import { IRefereeCreate, IRefereeUpdate } from "../types";

/**
 * Crea un nuevo árbitro
 *
 * Reglas de negocio:
 * - El nombre es obligatorio
 * - Email y DNI deben ser únicos si se proporcionan
 */
export async function createReferee(data: IRefereeCreate) {
  try {
    const {
      name,
      email,
      phone,
      nationalId,
      birthDate,
      nationality,
      imageUrl,
      certificationLevel,
    } = data;

    if (!name || name.trim() === "") {
      return { success: false, error: "El nombre es obligatorio" };
    }

    // Validar unicidad de email
    if (email) {
      const existingEmail = await db.referee.findFirst({
        where: { email, deletedAt: null },
      });
      if (existingEmail) {
        return { success: false, error: "Ya existe un árbitro con ese email" };
      }
    }

    // Validar unicidad de DNI
    if (nationalId) {
      const existingNationalId = await db.referee.findFirst({
        where: { nationalId, deletedAt: null },
      });
      if (existingNationalId) {
        return { success: false, error: "Ya existe un árbitro con ese DNI" };
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
    });

    revalidatePath("/admin/arbitros");
    return { success: true, data: referee };
  } catch (error) {
    console.error("Error creating referee:", error);
    return { success: false, error: "Error al crear árbitro" };
  }
}

/**
 * Obtiene todos los árbitros
 *
 * @param includeDisabled - Si true, incluye árbitros deshabilitados
 * @param includeDeleted - Si true, incluye árbitros eliminados lógicamente
 */
export async function getReferees(
  includeDisabled = true,
  includeDeleted = false,
) {
  try {
    const whereClause: Record<string, unknown> = {};

    if (!includeDeleted) {
      whereClause.deletedAt = null;
    }

    if (!includeDisabled) {
      whereClause.enabled = true;
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
    return { success: true, data: referees };
  } catch (error) {
    console.error("Error fetching referees:", error);
    return { success: false, data: [] };
  }
}

/**
 * Obtiene un árbitro por ID
 */
export async function getRefereeById(id: string) {
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
      return { success: false, error: "Árbitro no encontrado" };
    }

    return { success: true, data: referee };
  } catch (error) {
    console.error("Error fetching referee:", error);
    return { success: false, error: "Error al obtener árbitro" };
  }
}

/**
 * Actualiza un árbitro existente
 *
 * Reglas de negocio:
 * - Email y DNI deben ser únicos si se cambian
 * - No se puede actualizar un árbitro eliminado lógicamente
 */
export async function updateReferee(id: string, data: IRefereeUpdate) {
  try {
    // Verificar que existe y no está eliminado
    const existingReferee = await db.referee.findUnique({
      where: { id },
    });

    if (!existingReferee) {
      return { success: false, error: "Árbitro no encontrado" };
    }

    if (existingReferee.deletedAt) {
      return {
        success: false,
        error: "No se puede actualizar un árbitro eliminado",
      };
    }

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
    } = data;

    // Validar unicidad de email si se cambia
    if (email && email !== existingReferee.email) {
      const existingEmail = await db.referee.findFirst({
        where: { email, deletedAt: null, NOT: { id } },
      });
      if (existingEmail) {
        return { success: false, error: "Ya existe un árbitro con ese email" };
      }
    }

    // Validar unicidad de DNI si se cambia
    if (nationalId && nationalId !== existingReferee.nationalId) {
      const existingNationalId = await db.referee.findFirst({
        where: { nationalId, deletedAt: null, NOT: { id } },
      });
      if (existingNationalId) {
        return { success: false, error: "Ya existe un árbitro con ese DNI" };
      }
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

    await db.referee.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/admin/arbitros");
    return { success: true };
  } catch (error) {
    console.error("Error updating referee:", error);
    return { success: false, error: "Error al actualizar árbitro" };
  }
}

/**
 * Alterna el estado habilitado/deshabilitado de un árbitro
 */
export async function toggleRefereeEnabled(id: string) {
  try {
    const referee = await db.referee.findUnique({
      where: { id },
    });

    if (!referee) {
      return { success: false, error: "Árbitro no encontrado" };
    }

    if (referee.deletedAt) {
      return {
        success: false,
        error: "No se puede modificar un árbitro eliminado",
      };
    }

    const newEnabled = !referee.enabled;
    const newStatus: RefereeStatus = newEnabled ? "ACTIVO" : "INACTIVO";

    await db.referee.update({
      where: { id },
      data: {
        enabled: newEnabled,
        status: newStatus,
      },
    });

    revalidatePath("/admin/arbitros");
    return {
      success: true,
      enabled: newEnabled,
      message: newEnabled ? "Árbitro habilitado" : "Árbitro deshabilitado",
    };
  } catch (error) {
    console.error("Error toggling referee:", error);
    return { success: false, error: "Error al cambiar estado del árbitro" };
  }
}

/**
 * Cambia el estado de un árbitro
 */
export async function updateRefereeStatus(id: string, status: RefereeStatus) {
  try {
    const referee = await db.referee.findUnique({
      where: { id },
    });

    if (!referee) {
      return { success: false, error: "Árbitro no encontrado" };
    }

    if (referee.deletedAt) {
      return {
        success: false,
        error: "No se puede modificar un árbitro eliminado",
      };
    }

    await db.referee.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/admin/arbitros");
    return { success: true };
  } catch (error) {
    console.error("Error updating referee status:", error);
    return { success: false, error: "Error al cambiar estado del árbitro" };
  }
}

/**
 * Elimina un árbitro (eliminación lógica por defecto)
 *
 * Reglas de negocio:
 * - Por defecto realiza eliminación lógica (soft delete)
 * - La eliminación física solo es posible si no tiene partidos asignados
 */
export async function deleteReferee(id: string, permanent = false) {
  try {
    const referee = await db.referee.findUnique({
      where: { id },
      include: {
        _count: {
          select: { matches: true },
        },
      },
    });

    if (!referee) {
      return { success: false, error: "Árbitro no encontrado" };
    }

    if (permanent) {
      // Verificar si tiene partidos asignados
      if (referee._count.matches > 0) {
        return {
          success: false,
          error:
            "No se puede eliminar permanentemente un árbitro con partidos asignados",
        };
      }

      await db.referee.delete({
        where: { id },
      });
    } else {
      // Eliminación lógica
      await db.referee.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          enabled: false,
          status: "INACTIVO",
        },
      });
    }

    revalidatePath("/admin/arbitros");
    return { success: true };
  } catch (error) {
    console.error("Error deleting referee:", error);
    return { success: false, error: "Error al eliminar árbitro" };
  }
}

/**
 * Restaura un árbitro eliminado lógicamente
 */
export async function restoreReferee(id: string) {
  try {
    const referee = await db.referee.findUnique({
      where: { id },
    });

    if (!referee) {
      return { success: false, error: "Árbitro no encontrado" };
    }

    if (!referee.deletedAt) {
      return { success: false, error: "El árbitro no está eliminado" };
    }

    await db.referee.update({
      where: { id },
      data: {
        deletedAt: null,
        enabled: true,
        status: "ACTIVO",
      },
    });

    revalidatePath("/admin/arbitros");
    return { success: true };
  } catch (error) {
    console.error("Error restoring referee:", error);
    return { success: false, error: "Error al restaurar árbitro" };
  }
}
