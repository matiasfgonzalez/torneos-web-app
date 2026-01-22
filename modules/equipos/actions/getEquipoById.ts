"use server";

import { db } from "@/lib/db";

export async function getEquipoById(id: string) {
  try {
    const equipo = await db.team.findUnique({
      where: { id },
      include: {
        tournamentTeams: {
          include: {
            tournament: true,
            teamPlayer: {
              include: {
                player: true,
              },
            },
            homeMatches: {
              include: {
                awayTeam: {
                  include: {
                    team: true,
                  },
                },
              },
              orderBy: {
                dateTime: "desc",
              },
              take: 10,
            },
            awayMatches: {
              include: {
                homeTeam: {
                  include: {
                    team: true,
                  },
                },
              },
              orderBy: {
                dateTime: "desc",
              },
              take: 10,
            },
          },
        },
      },
    });

    if (!equipo) {
      return null;
    }

    // Agregar estadísticas globales
    const estadisticas = {
      totalTorneos: equipo.tournamentTeams.length,
      totalPartidos: equipo.tournamentTeams.reduce(
        (acc, tt) => acc + tt.matchesPlayed,
        0
      ),
      totalVictorias: equipo.tournamentTeams.reduce(
        (acc, tt) => acc + tt.wins,
        0
      ),
      totalEmpates: equipo.tournamentTeams.reduce(
        (acc, tt) => acc + tt.draws,
        0
      ),
      totalDerrotas: equipo.tournamentTeams.reduce(
        (acc, tt) => acc + tt.losses,
        0
      ),
      totalGolesAFavor: equipo.tournamentTeams.reduce(
        (acc, tt) => acc + tt.goalsFor,
        0
      ),
      totalGolesEnContra: equipo.tournamentTeams.reduce(
        (acc, tt) => acc + tt.goalsAgainst,
        0
      ),
      totalPuntos: equipo.tournamentTeams.reduce(
        (acc, tt) => acc + tt.points,
        0
      ),
    };

    // Obtener jugadores únicos de todos los torneos
    const jugadoresUnicos = new Map();
    equipo.tournamentTeams.forEach((tt) => {
      tt.teamPlayer.forEach((tp) => {
        if (!jugadoresUnicos.has(tp.player.id)) {
          jugadoresUnicos.set(tp.player.id, {
            ...tp.player,
            number: tp.number,
            position: tp.position || tp.player.position,
            status: tp.status,
          });
        }
      });
    });

    // Obtener todos los partidos (home + away)
    const todosLosPartidos: any[] = [];
    equipo.tournamentTeams.forEach((tt) => {
      tt.homeMatches.forEach((match) => {
        todosLosPartidos.push({
          ...match,
          esLocal: true,
          equipoRival: match.awayTeam.team,
          torneoNombre: tt.tournament.name,
        });
      });
      tt.awayMatches.forEach((match) => {
        todosLosPartidos.push({
          ...match,
          esLocal: false,
          equipoRival: match.homeTeam.team,
          torneoNombre: tt.tournament.name,
        });
      });
    });

    // Ordenar partidos por fecha (más recientes primero)
    todosLosPartidos.sort(
      (a, b) =>
        new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
    );

    return {
      ...equipo,
      estadisticas,
      jugadores: Array.from(jugadoresUnicos.values()),
      partidos: todosLosPartidos.slice(0, 20), // Limitar a 20 partidos
    };
  } catch (error) {
    console.error("Error fetching equipo by ID:", error);
    return null;
  }
}

