"use server";

import { db } from "@/lib/db";

export interface TopScorer {
  position: number;
  playerId: string;
  playerName: string;
  teamName: string;
  teamLogoUrl: string | null;
  goals: number;
}

export interface LeastConceded {
  position: number;
  teamId: string;
  teamName: string;
  teamLogoUrl: string | null;
  goalsAgainst: number;
  matchesPlayed: number;
}

export interface CardStats {
  position: number;
  playerId: string;
  playerName: string;
  teamName: string;
  teamLogoUrl: string | null;
  yellowCards: number;
  redCards: number;
  totalCards: number;
}

export interface TournamentStats {
  topScorers: TopScorer[];
  leastConceded: LeastConceded[];
  mostCarded: CardStats[];
  totalGoals: number;
  totalMatches: number;
  totalYellowCards: number;
  totalRedCards: number;
}

export async function getTournamentStats(
  tournamentId: string,
): Promise<TournamentStats> {
  try {
    // Obtener todos los goles del torneo agrupados por jugador
    const goals = await db.goal.findMany({
      where: {
        match: {
          tournamentId,
          status: "FINALIZADO",
        },
      },
      include: {
        teamPlayer: {
          include: {
            player: true,
            tournamentTeam: {
              include: {
                team: true,
              },
            },
          },
        },
      },
    });

    // Agrupar goles por jugador
    const goalsByPlayer = goals.reduce(
      (acc, goal) => {
        const playerId = goal.teamPlayer?.player?.id;
        if (!playerId) return acc;

        if (!acc[playerId]) {
          acc[playerId] = {
            playerId,
            playerName: goal.teamPlayer?.player?.name || "Desconocido",
            teamName:
              goal.teamPlayer?.tournamentTeam?.team?.name || "Sin equipo",
            teamLogoUrl: goal.teamPlayer?.tournamentTeam?.team?.logoUrl || null,
            goals: 0,
          };
        }
        // No contar autogoles como goles del jugador
        if (!goal.isOwnGoal) {
          acc[playerId].goals++;
        }
        return acc;
      },
      {} as Record<string, Omit<TopScorer, "position">>,
    );

    // Ordenar y asignar posiciones
    const topScorers: TopScorer[] = Object.values(goalsByPlayer)
      .sort((a, b) => b.goals - a.goals)
      .slice(0, 10)
      .map((scorer, index) => ({
        ...scorer,
        position: index + 1,
      }));

    // Obtener equipos con menos goles en contra (vallas menos vencidas)
    const tournamentTeams = await db.tournamentTeam.findMany({
      where: {
        tournamentId,
        matchesPlayed: { gt: 0 },
      },
      include: {
        team: true,
      },
      orderBy: [{ goalsAgainst: "asc" }, { matchesPlayed: "desc" }],
      take: 10,
    });

    const leastConceded: LeastConceded[] = tournamentTeams.map((tt, index) => ({
      position: index + 1,
      teamId: tt.team.id,
      teamName: tt.team.name,
      teamLogoUrl: tt.team.logoUrl,
      goalsAgainst: tt.goalsAgainst,
      matchesPlayed: tt.matchesPlayed,
    }));

    // Obtener tarjetas del torneo agrupadas por jugador
    const cards = await db.card.findMany({
      where: {
        match: {
          tournamentId,
        },
      },
      include: {
        teamPlayer: {
          include: {
            player: true,
            tournamentTeam: {
              include: {
                team: true,
              },
            },
          },
        },
      },
    });

    // Agrupar tarjetas por jugador
    const cardsByPlayer = cards.reduce(
      (acc, card) => {
        const playerId = card.teamPlayer?.player?.id;
        if (!playerId) return acc;

        if (!acc[playerId]) {
          acc[playerId] = {
            playerId,
            playerName: card.teamPlayer?.player?.name || "Desconocido",
            teamName:
              card.teamPlayer?.tournamentTeam?.team?.name || "Sin equipo",
            teamLogoUrl: card.teamPlayer?.tournamentTeam?.team?.logoUrl || null,
            yellowCards: 0,
            redCards: 0,
            totalCards: 0,
          };
        }
        if (card.type === "AMARILLA") {
          acc[playerId].yellowCards++;
        } else if (card.type === "ROJA") {
          acc[playerId].redCards++;
        }
        acc[playerId].totalCards =
          acc[playerId].yellowCards + acc[playerId].redCards;
        return acc;
      },
      {} as Record<string, Omit<CardStats, "position">>,
    );

    // Ordenar por total de tarjetas
    const mostCarded: CardStats[] = Object.values(cardsByPlayer)
      .sort((a, b) => b.totalCards - a.totalCards)
      .slice(0, 10)
      .map((player, index) => ({
        ...player,
        position: index + 1,
      }));

    // Estadísticas generales
    const matchesCount = await db.match.count({
      where: {
        tournamentId,
        status: "FINALIZADO",
      },
    });

    const totalYellowCards = cards.filter((c) => c.type === "AMARILLA").length;
    const totalRedCards = cards.filter((c) => c.type === "ROJA").length;

    return {
      topScorers,
      leastConceded,
      mostCarded,
      totalGoals: goals.filter((g) => !g.isOwnGoal).length,
      totalMatches: matchesCount,
      totalYellowCards,
      totalRedCards,
    };
  } catch (error) {
    console.error("Error al obtener estadísticas del torneo:", error);
    return {
      topScorers: [],
      leastConceded: [],
      mostCarded: [],
      totalGoals: 0,
      totalMatches: 0,
      totalYellowCards: 0,
      totalRedCards: 0,
    };
  }
}
