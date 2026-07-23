"use server";

import { ITorneo } from "@modules/torneos/types";
import { db } from "@/lib/db";

export async function getTorneoById(id: string): Promise<ITorneo | null> {
  try {
    const torneo = await db.tournament.findFirst({
      where: { id, deletedAt: null },
      // A3: se sacó `tournamentTeams.tournament` (el padre YA es el torneo,
      // era dato repetido) y, de cada partido, `goals`/`cards`/`referees` —
      // eran el mayor multiplicador del payload (3 relaciones anidadas por
      // partido). El detalle de eventos se pide aparte al abrir el modal
      // (`getMatchEvents`). El plantel (`teamPlayer`) se mantiene porque lo usa
      // el panel (sanciones); la vista pública lo sobre-trae — anotado en A3.
      include: {
        tournamentTeams: {
          include: {
            team: true,
            teamPlayer: {
              include: {
                player: true,
              },
            },
            phaseStats: {
              include: {
                tournamentPhase: true, // fase, para filtrar la tabla por tipo
              },
            },
          },
        },
        tournamentPhases: {
          orderBy: { order: "asc" },
        },
        matches: {
          include: {
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
            tournamentPhase: true, // fase del partido (badge)
          },
          orderBy: { dateTime: "asc" },
        },
      },
    });

    if (!torneo) return null;

    // `inscriptionFee` es Decimal (S3): se pasa a number acá porque este objeto
    // termina cruzando a client components (Header, HeaderTorneo) y un Decimal
    // no atraviesa el límite RSC.
    return {
      ...torneo,
      inscriptionFee: torneo.inscriptionFee
        ? Number(torneo.inscriptionFee)
        : null,
    } as unknown as ITorneo;
  } catch (error) {
    console.error("Error al obtener torneo por ID:", error);
    throw error;
  }
}
