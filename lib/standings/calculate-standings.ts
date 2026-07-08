import { db } from "@/lib/db";
import { MatchStatus, Prisma } from "@prisma/client";
import { MatchResult, extractMatchResult } from "./utils";
import { phaseTypeCountsPoints } from "./phase-utils";
import { DEFAULT_POINTS, PointsConfig } from "./config";

// Re-exportar para compatibilidad con código existente que importa desde aquí
export { extractMatchResult };

/**
 * Cliente de base de datos: acepta tanto `db` como un cliente de transacción.
 * Todas las operaciones de standings deben correr dentro de `db.$transaction`
 * junto con la mutación del partido que las origina.
 */
type DbClient = Prisma.TransactionClient;

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
 * Calcula las estadísticas de un equipo basado en un resultado.
 * @param teamScore - Goles del equipo
 * @param opponentScore - Goles del oponente
 * @param points - Puntos por victoria/empate/derrota del torneo (N7)
 * @returns Estadísticas calculadas
 */
function calculateTeamStats(
  teamScore: number,
  opponentScore: number,
  points: PointsConfig,
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
    points: isWin
      ? points.pointsWin
      : isDraw
        ? points.pointsDraw
        : points.pointsLoss,
  };
}

/**
 * Multiplica las estadísticas por un signo (+1 sumar, -1 restar)
 */
function scaleStats(stats: TeamStatsUpdate, sign: 1 | -1): TeamStatsUpdate {
  return {
    matchesPlayed: sign * stats.matchesPlayed,
    wins: sign * stats.wins,
    draws: sign * stats.draws,
    losses: sign * stats.losses,
    goalsFor: sign * stats.goalsFor,
    goalsAgainst: sign * stats.goalsAgainst,
    goalDifference: sign * stats.goalDifference,
    points: sign * stats.points,
  };
}

/**
 * Determina si la fase del partido suma a la tabla general del torneo.
 * Sin fase asignada → suma (comportamiento por defecto).
 * Fases KNOCKOUT → no suman puntos a la tabla general (solo a TeamPhaseStats).
 */
async function phaseCountsForGlobal(
  tx: DbClient,
  tournamentPhaseId: string | null | undefined,
): Promise<boolean> {
  if (!tournamentPhaseId) return true;
  const phase = await tx.tournamentPhase.findUnique({
    where: { id: tournamentPhaseId },
    select: { type: true },
  });
  return phaseTypeCountsPoints(phase?.type);
}

/**
 * Aplica estadísticas incrementales a un TournamentTeam y opcionalmente a una Fase
 */
async function applyStatsToTeam(
  tx: DbClient,
  teamId: string,
  stats: TeamStatsUpdate,
  tournamentPhaseId: string | null | undefined,
  countsForGlobal: boolean,
): Promise<void> {
  // 1. Actualizar estadísticas globales del torneo (solo si la fase suma puntos)
  if (countsForGlobal) {
    await tx.tournamentTeam.update({
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
  }

  // 2. Actualizar estadísticas de la fase específica (si aplica)
  if (tournamentPhaseId) {
    await tx.teamPhaseStats.upsert({
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
 * Verifica si un resultado es "contable".
 * FINALIZADO y WALKOVER computan (WALKOVER se carga con marcador fijo, ej. 3-0).
 */
function isCountableResult(result: MatchResult | null): boolean {
  if (!result) return false;
  return (
    (result.status === MatchStatus.FINALIZADO ||
      result.status === MatchStatus.WALKOVER) &&
    result.homeScore !== null &&
    result.awayScore !== null
  );
}

/**
 * Suma (sign=1) o resta (sign=-1) un resultado a las tablas.
 * Las queries corren secuenciales: el cliente de transacción de Prisma
 * no soporta operaciones concurrentes.
 */
async function applyResultDelta(
  tx: DbClient,
  result: MatchResult,
  sign: 1 | -1,
  points: PointsConfig,
): Promise<void> {
  const countsForGlobal = await phaseCountsForGlobal(
    tx,
    result.tournamentPhaseId,
  );

  const homeStats = scaleStats(
    calculateTeamStats(result.homeScore!, result.awayScore!, points),
    sign,
  );
  const awayStats = scaleStats(
    calculateTeamStats(result.awayScore!, result.homeScore!, points),
    sign,
  );

  await applyStatsToTeam(
    tx,
    result.homeTeamId,
    homeStats,
    result.tournamentPhaseId,
    countsForGlobal,
  );
  await applyStatsToTeam(
    tx,
    result.awayTeamId,
    awayStats,
    result.tournamentPhaseId,
    countsForGlobal,
  );
}

/**
 * Aplica el resultado de un partido a las tablas de posiciones.
 * Maneja ediciones y reversiones: resta el estado anterior (si contaba)
 * y suma el nuevo (si cuenta). Cubre cambios de fase, de equipos y de marcador.
 *
 * ⚠️ Debe llamarse dentro de la MISMA transacción que la mutación del partido.
 *
 * @param tx - Cliente de transacción de Prisma
 * @param previousResult - Estado anterior del partido (null si es nuevo)
 * @param newResult - Nuevo estado del partido
 * @param points - Puntos por resultado del torneo (N7). Por defecto 3-1-0.
 */
export async function applyMatchResult(
  tx: DbClient,
  previousResult: MatchResult | null,
  newResult: MatchResult,
  points: PointsConfig = DEFAULT_POINTS,
): Promise<void> {
  if (previousResult && isCountableResult(previousResult)) {
    await applyResultDelta(tx, previousResult, -1, points);
  }

  if (isCountableResult(newResult)) {
    await applyResultDelta(tx, newResult, 1, points);
  }
}

/**
 * Recalcula completamente las estadísticas de un torneo desde cero.
 * Corre en una única transacción: resetea TournamentTeam y TeamPhaseStats
 * (conservando `bonusPoints` manuales) y reaplica todos los partidos contables.
 *
 * @param tournamentId - ID del torneo a recalcular
 */
export async function recalculateTournamentStandings(
  tournamentId: string,
): Promise<void> {
  await db.$transaction(
    async (tx) => {
      // 0. Leer la configuración de puntos del torneo (N7)
      const tournament = await tx.tournament.findUnique({
        where: { id: tournamentId },
        select: { pointsWin: true, pointsDraw: true, pointsLoss: true },
      });
      const points: PointsConfig = tournament ?? DEFAULT_POINTS;

      const resetStats = {
        matchesPlayed: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
      };

      // 1. Resetear estadísticas globales del torneo
      await tx.tournamentTeam.updateMany({
        where: { tournamentId },
        data: resetStats,
      });

      // 2. Resetear estadísticas por fase (updateMany y no deleteMany,
      // para conservar los bonusPoints cargados manualmente)
      await tx.teamPhaseStats.updateMany({
        where: { tournamentTeam: { tournamentId } },
        data: resetStats,
      });

      // 3. Obtener todos los partidos contables del torneo
      const matches = await tx.match.findMany({
        where: {
          tournamentId,
          status: { in: [MatchStatus.FINALIZADO, MatchStatus.WALKOVER] },
          homeScore: { not: null },
          awayScore: { not: null },
        },
        select: {
          homeTeamId: true,
          awayTeamId: true,
          homeScore: true,
          awayScore: true,
          status: true,
          tournamentPhaseId: true,
        },
      });

      // 4. Aplicar cada partido con los puntos configurados del torneo
      for (const match of matches) {
        await applyMatchResult(tx, null, extractMatchResult(match), points);
      }
    },
    { timeout: 30000 },
  );
}
