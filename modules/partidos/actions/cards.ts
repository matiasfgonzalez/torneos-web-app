"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { CardType } from "@prisma/client";
import { getMatchOrgId, requireActionOrgAccess } from "@/lib/orgAuth";
import {
  hasActiveSuspension,
  recomputeTournamentSuspensions,
} from "@/lib/suspensions/engine";

export async function addCard(data: {
  matchId: string;
  teamPlayerId: string;
  type: CardType;
  minute?: number;
  reason?: string;
}): Promise<{
  success: boolean;
  error?: string;
  doubleYellow?: boolean;
  suspendedWarning?: boolean;
}> {
  const orgId = await getMatchOrgId(data.matchId);
  if (!orgId) return { success: false, error: "Partido no encontrado" };

  // Carga de resultados: COLABORADOR también puede
  const auth = await requireActionOrgAccess(orgId, { allowCollaborator: true });
  if (auth.error) return { success: false, error: auth.error };

  try {
    const { matchId, teamPlayerId, type, minute, reason } = data;

    // Verificar que el partido existe
    const match = await db.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      return { success: false, error: "Partido no encontrado" };
    }

    // ¿El jugador ya arrastraba una suspensión activa? (N8) → avisar al final
    const suspendedWarning = await hasActiveSuspension(teamPlayerId);

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

      // Recalcular sanciones automáticas del torneo (N8)
      await recomputeTournamentSuspensions(match.tournamentId);

      revalidatePath(`/admin/torneos/${match.tournamentId}`);
      return { success: true, doubleYellow: true, suspendedWarning };
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

    // Recalcular sanciones automáticas del torneo (N8)
    await recomputeTournamentSuspensions(match.tournamentId);

    revalidatePath(`/admin/torneos/${match.tournamentId}`);
    return { success: true, suspendedWarning };
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

    const orgId = await getMatchOrgId(card.matchId);
    if (!orgId) return { success: false, error: "Partido no encontrado" };

    const auth = await requireActionOrgAccess(orgId, {
      allowCollaborator: true,
    });
    if (auth.error) return { success: false, error: auth.error };

    await db.card.delete({
      where: { id: cardId },
    });

    // Recalcular sanciones automáticas del torneo (N8)
    await recomputeTournamentSuspensions(card.match.tournamentId);

    revalidatePath(`/admin/torneos/${card.match.tournamentId}`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting card:", error);
    return { success: false, error: "Error al eliminar tarjeta" };
  }
}
