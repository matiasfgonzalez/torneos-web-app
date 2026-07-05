"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import {
  applyMatchResult,
  extractMatchResult,
} from "@/lib/standings/calculate-standings";
import { requireActionRole } from "@/lib/actionRoleValidation";

export async function addGoal(data: {
  matchId: string;
  teamPlayerId: string;
  teamId: string; // ID del equipo (TournamentTeam) que hizo el gol
  minute: number;
  isOwnGoal: boolean;
  isPenalty: boolean;
}) {
  const auth = await requireActionRole(["ADMINISTRADOR", "EDITOR", "ORGANIZADOR"]);
  if (auth.error) return { success: false, error: auth.error };

  try {
    // 1. Obtener estado anterior del partido
    const previousMatch = await db.match.findUnique({
      where: { id: data.matchId },
      include: {
        tournament: true,
      },
    });

    if (!previousMatch) throw new Error("Partido no encontrado");

    // 2. Determinar a quién sumar el gol en el marcador
    // Si es autogol, se suma al equipo contrario
    // Si NO es autogol, se suma al equipo del jugador
    const isHome = previousMatch.homeTeamId === data.teamId;
    let incrementHome = 0;
    let incrementAway = 0;

    if (isHome) {
      if (data.isOwnGoal) incrementAway = 1; else incrementHome = 1;
    } else {
      if (data.isOwnGoal) incrementHome = 1; else incrementAway = 1;
    }

    // 3. Gol + marcador + tabla de posiciones en una única transacción
    await db.$transaction(async (tx) => {
      await tx.goal.create({
        data: {
          matchId: data.matchId,
          teamPlayerId: data.teamPlayerId,
          minute: data.minute,
          isOwnGoal: data.isOwnGoal,
          isPenalty: data.isPenalty,
        },
      });

      const updatedMatch = await tx.match.update({
        where: { id: data.matchId },
        data: {
          homeScore: (previousMatch.homeScore || 0) + incrementHome,
          awayScore: (previousMatch.awayScore || 0) + incrementAway,
        },
      });

      await applyMatchResult(
        tx,
        extractMatchResult(previousMatch),
        extractMatchResult(updatedMatch),
      );
    });

    revalidatePath(`/admin/torneos/${previousMatch.tournamentId}`);
    return { success: true };
  } catch (error) {
    console.error("Error adding goal:", error);
    return { success: false, error: "Error al agregar gol" };
  }
}

export async function deleteGoal(goalId: string) {
  const auth = await requireActionRole(["ADMINISTRADOR", "EDITOR", "ORGANIZADOR"]);
  if (auth.error) return { success: false, error: auth.error };

  try {
    // 1. Obtener el gol y el partido asociado
    const goal = await db.goal.findUnique({
      where: { id: goalId },
      include: {
        match: true,
        teamPlayer: true,
      },
    });

    if (!goal) throw new Error("Gol no encontrado");

    const previousMatch = await db.match.findUnique({
      where: { id: goal.matchId },
    });
    
    if (!previousMatch) throw new Error("Partido no encontrado");

    // 2. Determinar a quién restar el gol
    // Necesitamos saber de qué equipo era el jugador
    // teamPlayer tiene tournamentTeamId
    const isHome = previousMatch.homeTeamId === goal.teamPlayer.tournamentTeamId;
    
    let decrementHome = 0;
    let decrementAway = 0;

    if (isHome) {
      if (goal.isOwnGoal) decrementAway = 1; else decrementHome = 1;
    } else {
      if (goal.isOwnGoal) decrementHome = 1; else decrementAway = 1;
    }

    // 3. Calcular nuevo marcador (asegurando no bajar de 0)
    const newHomeScore = Math.max(0, (previousMatch.homeScore || 0) - decrementHome);
    const newAwayScore = Math.max(0, (previousMatch.awayScore || 0) - decrementAway);

    // 4. Borrado + marcador + tabla de posiciones en una única transacción
    await db.$transaction(async (tx) => {
      await tx.goal.delete({
        where: { id: goalId },
      });

      const updatedMatch = await tx.match.update({
        where: { id: goal.matchId },
        data: {
          homeScore: newHomeScore,
          awayScore: newAwayScore,
        },
      });

      await applyMatchResult(
        tx,
        extractMatchResult(previousMatch),
        extractMatchResult(updatedMatch),
      );
    });

    revalidatePath(`/admin/torneos/${previousMatch.tournamentId}`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting goal:", error);
    return { success: false, error: "Error al eliminar gol" };
  }
}

