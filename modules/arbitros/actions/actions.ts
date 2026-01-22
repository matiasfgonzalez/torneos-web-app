"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createReferee(data: {
  name: string;
  email?: string;
  phone?: string;
  certificationLevel?: string;
}) {
  try {
    const { name, email, phone, certificationLevel } = data;

    if (!name) {
      return { success: false, error: "El nombre es obligatorio" };
    }

    await db.referee.create({
      data: {
        name,
        email,
        phone,
        certificationLevel,
      },
    });

    revalidatePath("/admin/arbitros");
    return { success: true };
  } catch (error) {
    console.error("Error creating referee:", error);
    return { success: false, error: "Error al crear árbitro" };
  }
}

export async function getReferees() {
  try {
    const referees = await db.referee.findMany({
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

export async function deleteReferee(id: string) {
  try {
    await db.referee.delete({
      where: { id },
    });
    revalidatePath("/admin/arbitros");
    return { success: true };
  } catch (error) {
    console.error("Error deleting referee:", error);
    return { success: false, error: "Error al eliminar árbitro" };
  }
}

export async function updateReferee(id: string, data: {
    name: string;
    email?: string;
    phone?: string;
    certificationLevel?: string;
  }) {
    try {
      await db.referee.update({
        where: { id },
        data,
      });
      revalidatePath("/admin/arbitros");
      return { success: true };
    } catch (error) {
      console.error("Error updating referee:", error);
      return { success: false, error: "Error al actualizar árbitro" };
    }
  }

