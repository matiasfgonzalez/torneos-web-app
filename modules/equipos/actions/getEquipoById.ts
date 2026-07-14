"use server";

import { db } from "@/lib/db";
import type { Prisma, Team } from "@prisma/client";

/**
 * `include` de la ficha de equipo. Se declara aparte para poder **derivar los
 * tipos de él** (abajo): así el tipo del retorno no se desincroniza del query
 * — era la raíz de los `any` que arrastraban Header, QuickStats, TabsTeam,
 * PublicTabsTeam, PublicTeamHeader y MatchCard.
 */
const teamDetailInclude = {
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
          goals: {
            include: {
              teamPlayer: {
                include: {
                  player: true,
                  tournamentTeam: true,
                },
              },
            },
          },
          cards: {
            include: {
              teamPlayer: {
                include: {
                  player: true,
                  tournamentTeam: true,
                },
              },
            },
          },
          referees: {
            include: {
              referee: true,
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
          goals: {
            include: {
              teamPlayer: {
                include: {
                  player: true,
                  tournamentTeam: true,
                },
              },
            },
          },
          cards: {
            include: {
              teamPlayer: {
                include: {
                  player: true,
                  tournamentTeam: true,
                },
              },
            },
          },
          referees: {
            include: {
              referee: true,
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
} satisfies Prisma.TeamInclude;

type TeamWithRelations = Prisma.TeamGetPayload<{
  include: typeof teamDetailInclude;
}>;

type TournamentTeamWithRelations = TeamWithRelations["tournamentTeams"][number];

/** Partido de la ficha, ya normalizado desde el punto de vista de ESTE equipo. */
export type TeamMatch = (
  | TournamentTeamWithRelations["homeMatches"][number]
  | TournamentTeamWithRelations["awayMatches"][number]
) & {
  esLocal: boolean;
  equipoRival: Team;
  torneoNombre: string;
};

/**
 * Jugador del plantel: el `Player` + sus datos en ESTE equipo (dorsal, puesto).
 *
 * `position` y `status` se pisan a propósito: en `Player` son enums, pero en
 * `TeamPlayer` (el jugador dentro de un equipo-torneo) `position` es texto
 * libre — puede ser un puesto que el enum no contempla. Por eso el `Omit`.
 */
export type TeamSquadPlayer = Omit<
  TournamentTeamWithRelations["teamPlayer"][number]["player"],
  "position" | "status"
> & {
  number: number | null;
  position: string | null;
  status: string;
};

export interface TeamStats {
  totalTorneos: number;
  totalPartidos: number;
  totalVictorias: number;
  totalEmpates: number;
  totalDerrotas: number;
  totalGolesAFavor: number;
  totalGolesEnContra: number;
  totalPuntos: number;
}

/** Lo que consume la ficha de equipo (pública y del panel). */
export type TeamDetail = TeamWithRelations & {
  estadisticas: TeamStats;
  jugadores: TeamSquadPlayer[];
  partidos: TeamMatch[];
};

export async function getEquipoById(id: string): Promise<TeamDetail | null> {
  try {
    const equipo = await db.team.findUnique({
      where: { id },
      include: teamDetailInclude,
    });

    if (!equipo) {
      return null;
    }

    // Agregar estadísticas globales
    const estadisticas: TeamStats = {
      totalTorneos: equipo.tournamentTeams.length,
      totalPartidos: equipo.tournamentTeams.reduce(
        (acc, tt) => acc + tt.matchesPlayed,
        0,
      ),
      totalVictorias: equipo.tournamentTeams.reduce(
        (acc, tt) => acc + tt.wins,
        0,
      ),
      totalEmpates: equipo.tournamentTeams.reduce((acc, tt) => acc + tt.draws, 0),
      totalDerrotas: equipo.tournamentTeams.reduce(
        (acc, tt) => acc + tt.losses,
        0,
      ),
      totalGolesAFavor: equipo.tournamentTeams.reduce(
        (acc, tt) => acc + tt.goalsFor,
        0,
      ),
      totalGolesEnContra: equipo.tournamentTeams.reduce(
        (acc, tt) => acc + tt.goalsAgainst,
        0,
      ),
      totalPuntos: equipo.tournamentTeams.reduce((acc, tt) => acc + tt.points, 0),
    };

    // Obtener jugadores únicos de todos los torneos
    const jugadoresUnicos = new Map<string, TeamSquadPlayer>();
    equipo.tournamentTeams.forEach((tt) => {
      tt.teamPlayer.forEach((tp) => {
        if (!jugadoresUnicos.has(tp.player.id)) {
          jugadoresUnicos.set(tp.player.id, {
            ...tp.player,
            number: tp.number,
            position: tp.position ?? tp.player.position,
            status: tp.status,
          });
        }
      });
    });

    // Obtener todos los partidos (home + away)
    const todosLosPartidos: TeamMatch[] = [];
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
      (a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime(),
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
