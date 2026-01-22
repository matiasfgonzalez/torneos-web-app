"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { CardType } from "@prisma/client";

export async function addCard(data: {
  matchId: string;
  teamPlayerId: string;
  type: CardType;
  minute?: number;
  reason?: string;
}) {
  try {
    const { matchId, teamPlayerId, type, minute, reason } = data;

    // Verificar que el partido existe
    const match = await db.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      return { success: false, error: "Partido no encontrado" };
    }

    // Crear la tarjeta
    await db.card.create({
      data: {
        matchId,
        teamPlayerId,
        type,
        minute,
        reason,
      },
    });

    revalidatePath(`/admin/torneos/${match.tournamentId}`);
    return { success: true };
  } catch (error) {
    console.error("Error adding card:", error);
    return { success: false, error: "Error al registrar tarjeta" };
  }
}

export async function deleteCard(cardId: string) {
  try {
    const card = await db.card.findUnique({
      where: { id: cardId },
      include: { match: true },
    });

    if (!card) {
      return { success: false, error: "Tarjeta no encontrada" };
    }

    await db.card.delete({
      where: { id: cardId },
    });

    revalidatePath(`/admin/torneos/${card.match.tournamentId}`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting card:", error);
    return { success: false, error: "Error al eliminar tarjeta" };
  }
}

