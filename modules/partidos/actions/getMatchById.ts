"use server";

import { db } from "@/lib/db";
import { IPartidos } from "@modules/partidos/types";

/**
 * Partido completo por ID: equipos, torneo, fase, goles, tarjetas y árbitros.
 *
 * Los goles/tarjetas incluyen `tournamentTeam` porque sin eso no se puede saber
 * de qué lado del marcador va cada evento en la cronología (la ficha pública
 * `/partidos/[id]` y el modal del torneo lo necesitan).
 */
export async function getMatchById(id: string): Promise<IPartidos | null> {
  try {
    const match = await db.match.findUnique({
      where: { id },
      include: {
        tournament: {
          include: {
            // Para armar la URL canónica del torneo (tournamentPublicPath).
            organization: { select: { slug: true } },
          },
        },
        homeTeam: {
          include: {
            team: true,
          },
        },
        awayTeam: {
          include: {
            team: true,
          },
        },
        tournamentPhase: true,
        goals: {
          include: {
            teamPlayer: {
              include: {
                player: true,
                tournamentTeam: { include: { team: true } },
              },
            },
            assistTeamPlayer: {
              include: { player: true },
            },
          },
          orderBy: { minute: "asc" },
        },
        cards: {
          include: {
            teamPlayer: {
              include: {
                player: true,
                tournamentTeam: { include: { team: true } },
              },
            },
          },
          orderBy: { minute: "asc" },
        },
        referees: {
          include: {
            referee: true,
          },
        },
      },
    });

    return match as unknown as IPartidos | null;
  } catch (error) {
    console.error("Error al obtener partido por ID:", error);
    throw error;
  }
}
