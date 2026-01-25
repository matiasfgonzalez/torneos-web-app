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
}): Promise<{ success: boolean; error?: string; doubleYellow?: boolean }> {
  try {
    const { matchId, teamPlayerId, type, minute, reason } = data;

    // Verificar que el partido existe
    const match = await db.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      return { success: false, error: "Partido no encontrado" };
    }

    // Obtener las tarjetas existentes del jugador en este partido
    const existingCards = await db.card.findMany({
      where: {
        matchId,
        teamPlayerId,
      },
    });

    // Verificar si el jugador ya está expulsado
    const hasRedCard = existingCards.some((c) => c.type === CardType.ROJA);
    const yellowCount = existingCards.filter(
      (c) => c.type === CardType.AMARILLA,
    ).length;

    if (hasRedCard || yellowCount >= 2) {
      return { success: false, error: "El jugador ya está expulsado" };
    }

    // Si es una amarilla y ya tiene una, registrar como doble amarilla
    if (type === CardType.AMARILLA && yellowCount === 1) {
      // Crear la segunda amarilla
      await db.card.create({
        data: {
          matchId,
          teamPlayerId,
          type: CardType.AMARILLA,
          minute,
          reason: reason || "Segunda amarilla",
        },
      });

      // Crear la roja automática por doble amarilla
      await db.card.create({
        data: {
          matchId,
          teamPlayerId,
          type: CardType.ROJA,
          minute,
          reason: "Doble amarilla - Expulsión automática",
        },
      });

      revalidatePath(`/admin/torneos/${match.tournamentId}`);
      return { success: true, doubleYellow: true };
    }

    // Crear la tarjeta normal
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
