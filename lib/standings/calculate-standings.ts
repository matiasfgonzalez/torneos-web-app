"use server";

import { db } from "@/lib/db";
import { MatchStatus } from "@prisma/client";
import { MatchResult, extractMatchResult } from "./utils";

// Re-exportar para compatibilidad con código existente que importa desde aquí
export { extractMatchResult };

/**
 * Estadísticas que se actualizan en TournamentTeam
 */
interface TeamStatsUpdate {
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

/**
 * Calcula las estadísticas de un equipo basado en un resultado
 * @param teamScore - Goles del equipo  
 * @param opponentScore - Goles del oponente
 * @returns Estadísticas calculadas
 */
function calculateTeamStats(
  teamScore: number,
  opponentScore: number
): TeamStatsUpdate {
  const isWin = teamScore > opponentScore;
  const isDraw = teamScore === opponentScore;
  const isLoss = teamScore < opponentScore;

  return {
    matchesPlayed: 1,
    wins: isWin ? 1 : 0,
    draws: isDraw ? 1 : 0,
    losses: isLoss ? 1 : 0,
    goalsFor: teamScore,
    goalsAgainst: opponentScore,
    goalDifference: teamScore - opponentScore,
    points: isWin ? 3 : isDraw ? 1 : 0,
  };
}

/**
 * Invierte los signos de las estadísticas (para restar)
 */
function negateStats(stats: TeamStatsUpdate): TeamStatsUpdate {
  return {
    matchesPlayed: -stats.matchesPlayed,
    wins: -stats.wins,
    draws: -stats.draws,
    losses: -stats.losses,
    goalsFor: -stats.goalsFor,
    goalsAgainst: -stats.goalsAgainst,
    goalDifference: -stats.goalDifference,
    points: -stats.points,
  };
}

/**
 * Aplica estadísticas incrementales a un TournamentTeam y opcionalmente a una Fase
 */
async function applyStatsToTeam(
  teamId: string,
  stats: TeamStatsUpdate,
  tournamentPhaseId?: string | null
): Promise<void> {
  // 1. Actualizar estadísticas globales del torneo (Acumulado)
  await db.tournamentTeam.update({
    where: { id: teamId },
    data: {
      matchesPlayed: { increment: stats.matchesPlayed },
      wins: { increment: stats.wins },
      draws: { increment: stats.draws },
      losses: { increment: stats.losses },
      goalsFor: { increment: stats.goalsFor },
      goalsAgainst: { increment: stats.goalsAgainst },
      goalDifference: { increment: stats.goalDifference },
      points: { increment: stats.points },
    },
  });

  // 2. Actualizar estadísticas de la fase específica (si aplica)
  if (tournamentPhaseId) {
    await db.teamPhaseStats.upsert({
      where: {
        tournamentTeamId_tournamentPhaseId: {
          tournamentTeamId: teamId,
          tournamentPhaseId: tournamentPhaseId,
        },
      },
      create: {
        tournamentTeamId: teamId,
        tournamentPhaseId: tournamentPhaseId,
        matchesPlayed: stats.matchesPlayed,
        wins: stats.wins,
        draws: stats.draws,
        losses: stats.losses,
        goalsFor: stats.goalsFor,
        goalsAgainst: stats.goalsAgainst,
        goalDifference: stats.goalDifference,
        points: stats.points,
      },
      update: {
        matchesPlayed: { increment: stats.matchesPlayed },
        wins: { increment: stats.wins },
        draws: { increment: stats.draws },
        losses: { increment: stats.losses },
        goalsFor: { increment: stats.goalsFor },
        goalsAgainst: { increment: stats.goalsAgainst },
        goalDifference: { increment: stats.goalDifference },
        points: { increment: stats.points },
      },
    });
  }
}

/**
 * Verifica si un resultado es "contable" (partido finalizado con scores)
 */
function isCountableResult(result: MatchResult | null): boolean {
  if (!result) return false;
  return (
    result.status === MatchStatus.FINALIZADO &&
    result.homeScore !== null &&
    result.awayScore !== null
  );
}

/**
 * Aplica el resultado de un partido a las tablas de posiciones
 * Maneja correctamente ediciones y reversiones comparando estado anterior vs nuevo
 * 
 * @param previousResult - Estado anterior del partido (null si es nuevo)
 * @param newResult - Nuevo estado del partido
 */
export async function applyMatchResult(
  previousResult: MatchResult | null,
  newResult: MatchResult
): Promise<void> {
  const wasCounted = isCountableResult(previousResult);
  const shouldCount = isCountableResult(newResult);

  // Caso 1: El partido no era contable y sigue sin serlo → nada que hacer
  if (!wasCounted && !shouldCount) {
    return;
  }

  // Caso 2: El partido era contable pero ya no lo es → restar estadísticas
  if (wasCounted && !shouldCount && previousResult) {
    const homeStats = calculateTeamStats(
      previousResult.homeScore!,
      previousResult.awayScore!
    );
    const awayStats = calculateTeamStats(
      previousResult.awayScore!,
      previousResult.homeScore!
    );

    await Promise.all([
      applyStatsToTeam(previousResult.homeTeamId, negateStats(homeStats), previousResult.tournamentPhaseId),
      applyStatsToTeam(previousResult.awayTeamId, negateStats(awayStats), previousResult.tournamentPhaseId),
    ]);
    return;
  }

  // Caso 3: El partido no era contable pero ahora sí → sumar estadísticas
  if (!wasCounted && shouldCount) {
    const homeStats = calculateTeamStats(
      newResult.homeScore!,
      newResult.awayScore!
    );
    const awayStats = calculateTeamStats(
      newResult.awayScore!,
      newResult.homeScore!
    );

    await Promise.all([
      applyStatsToTeam(newResult.homeTeamId, homeStats, newResult.tournamentPhaseId),
      applyStatsToTeam(newResult.awayTeamId, awayStats, newResult.tournamentPhaseId),
    ]);
    return;
  }

  // Caso 4: El partido era y sigue siendo contable
  if (wasCounted && shouldCount && previousResult) {
    const oldHomeStats = calculateTeamStats(
      previousResult.homeScore!,
      previousResult.awayScore!
    );
    const oldAwayStats = calculateTeamStats(
      previousResult.awayScore!,
      previousResult.homeScore!
    );

    const newHomeStats = calculateTeamStats(
      newResult.homeScore!,
      newResult.awayScore!
    );
    const newAwayStats = calculateTeamStats(
      newResult.awayScore!,
      newResult.homeScore!
    );

    // Si la fase cambió, debemos restar de la vieja y sumar a la nueva por separado
    if (previousResult.tournamentPhaseId !== newResult.tournamentPhaseId) {
        await Promise.all([
            // Restar de la fase anterior
            applyStatsToTeam(previousResult.homeTeamId, negateStats(oldHomeStats), previousResult.tournamentPhaseId),
            applyStatsToTeam(previousResult.awayTeamId, negateStats(oldAwayStats), previousResult.tournamentPhaseId),
            // Sumar a la fase nueva
            applyStatsToTeam(newResult.homeTeamId, newHomeStats, newResult.tournamentPhaseId),
            applyStatsToTeam(newResult.awayTeamId, newAwayStats, newResult.tournamentPhaseId),
        ]);
    } else {
        // Misma fase: aplicar delta (optimizado) se hace restando y sumando o calculando diferencia
        // applyStatsToTeam acumula, asi que enviamos (negate(old) + new)
        // NOTA: applyStatsToTeam hace "increment", así que podemos llamar dos veces o calcular delta manual.
        // Llamar dos veces es seguro y reutiliza la lógica negate.
        
        await Promise.all([
          applyStatsToTeam(previousResult.homeTeamId, negateStats(oldHomeStats), previousResult.tournamentPhaseId),
          applyStatsToTeam(previousResult.awayTeamId, negateStats(oldAwayStats), previousResult.tournamentPhaseId),
          applyStatsToTeam(newResult.homeTeamId, newHomeStats, newResult.tournamentPhaseId),
          applyStatsToTeam(newResult.awayTeamId, newAwayStats, newResult.tournamentPhaseId),
        ]);
    }
    return;
  }
}

/**
 * Recalcula completamente las estadísticas de un torneo desde cero
 * Útil para corregir datos corruptos o inconsistentes
 * 
 * @param tournamentId - ID del torneo a recalcular
 */
export async function recalculateTournamentStandings(
  tournamentId: string
): Promise<void> {
  // 1. Resetear todas las estadísticas del torneo a cero
  await db.tournamentTeam.updateMany({
    where: { tournamentId },
    data: {
      matchesPlayed: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
    },
  });

  // 2. Obtener todos los partidos finalizados del torneo
  const matches = await db.match.findMany({
    where: {
      tournamentId,
      status: MatchStatus.FINALIZADO,
      homeScore: { not: null },
      awayScore: { not: null },
    },
    select: {
      homeTeamId: true,
      awayTeamId: true,
      homeScore: true,
      awayScore: true,
      status: true,
    },
  });

  // 3. Aplicar cada partido
  for (const match of matches) {
    await applyMatchResult(null, extractMatchResult(match));
  }
}

