"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import {
  applyMatchResult,
  extractMatchResult,
} from "@/lib/standings/calculate-standings";

export async function addGoal(data: {
  matchId: string;
  teamPlayerId: string;
  teamId: string; // ID del equipo (TournamentTeam) que hizo el gol
  minute: number;
  isOwnGoal: boolean;
  isPenalty: boolean;
}) {
  try {
    // 1. Obtener estado anterior del partido
    const previousMatch = await db.match.findUnique({
      where: { id: data.matchId },
      include: {
        tournament: true,
      },
    });

    if (!previousMatch) throw new Error("Partido no encontrado");

    // 2. Crear el gol
    await db.goal.create({
      data: {
        matchId: data.matchId,
        teamPlayerId: data.teamPlayerId,
        minute: data.minute,
        isOwnGoal: data.isOwnGoal,
        isPenalty: data.isPenalty,
      },
    });

    // 3. Determinar a quién sumar el gol en el marcador
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

    // 4. Actualizar marcador del partido
    const updatedMatch = await db.match.update({
      where: { id: data.matchId },
      data: {
        homeScore: (previousMatch.homeScore || 0) + incrementHome,
        awayScore: (previousMatch.awayScore || 0) + incrementAway,
      },
    });

    // 5. Aplicar cambios a la tabla de posiciones con deltas
    const previousResult = extractMatchResult(previousMatch);
    const newResult = extractMatchResult(updatedMatch);
    await applyMatchResult(previousResult, newResult);

    revalidatePath(`/admin/torneos/${previousMatch.tournamentId}`);
    return { success: true };
  } catch (error) {
    console.error("Error adding goal:", error);
    return { success: false, error: "Error al agregar gol" };
  }
}

export async function deleteGoal(goalId: string) {
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

    // 3. Eliminar el gol
    await db.goal.delete({
      where: { id: goalId },
    });

    // 4. Actualizar marcador del partido
    // Aseguramos no bajar de 0
    const newHomeScore = Math.max(0, (previousMatch.homeScore || 0) - decrementHome);
    const newAwayScore = Math.max(0, (previousMatch.awayScore || 0) - decrementAway);

    const updatedMatch = await db.match.update({
      where: { id: goal.matchId },
      data: {
        homeScore: newHomeScore,
        awayScore: newAwayScore,
      },
    });

    // 5. Aplicar cambios a la tabla de posiciones con deltas
    const previousResult = extractMatchResult(previousMatch);
    const newResult = extractMatchResult(updatedMatch);
    await applyMatchResult(previousResult, newResult);

    revalidatePath(`/admin/torneos/${previousMatch.tournamentId}`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting goal:", error);
    return { success: false, error: "Error al eliminar gol" };
  }
}

