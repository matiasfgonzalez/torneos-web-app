"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function assignRefereeToMatch(data: {
  matchId: string;
  refereeId: string;
  role: string;
}) {
  try {
    const { matchId, refereeId, role } = data;

    // Verificar si ya existe esa asignación
    const existing = await db.matchReferee.findUnique({
      where: {
        matchId_refereeId: {
          matchId,
          refereeId,
        },
      },
    });

    if (existing) {
      // Actualizar rol si ya existe
      await db.matchReferee.update({
        where: { id: existing.id },
        data: { role },
      });
    } else {
      // Crear nueva asignación
      await db.matchReferee.create({
        data: {
          matchId,
          refereeId,
          role,
        },
      });
    }

    const match = await db.match.findUnique({ where: { id: matchId } });
    if (match) {
        revalidatePath(`/admin/torneos/${match.tournamentId}`);
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error assigning referee:", error);
    return { success: false, error: "Error al asignar árbitro" };
  }
}

export async function removeRefereeFromMatch(matchId: string, refereeId: string) {
  try {
    await db.matchReferee.delete({
      where: {
        matchId_refereeId: {
          matchId,
          refereeId,
        },
      },
    });

    const match = await db.match.findUnique({ where: { id: matchId } });
    if (match) {
        revalidatePath(`/admin/torneos/${match.tournamentId}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error removing referee:", error);
    return { success: false, error: "Error al remover árbitro" };
  }
}

