"use server";

import { db } from "@/lib/db";

/**
 * Eventos de un partido (goles, tarjetas, árbitros) para el modal de detalle.
 *
 * Existe para NO arrastrar estas tres relaciones anidadas por **cada** partido
 * en `getTorneoById` (A3: era el mayor multiplicador del payload). La lista de
 * partidos va liviana; el detalle se pide solo cuando el hincha abre el modal.
 * `select` mínimo: exactamente lo que el modal dibuja, nada más.
 */
export interface MatchEventGoal {
  id: string;
  minute: number | null;
  isPenalty: boolean;
  isOwnGoal: boolean;
  teamPlayer: {
    tournamentTeam: { id: string } | null;
    player: { name: string } | null;
  } | null;
}

export interface MatchEventCard {
  id: string;
  minute: number | null;
  type: "AMARILLA" | "ROJA";
  reason: string | null;
  teamPlayer: {
    tournamentTeam: { id: string } | null;
    player: { name: string } | null;
  } | null;
}

export interface MatchEventReferee {
  id: string;
  role: string;
  referee: { name: string; certificationLevel: string | null } | null;
}

export interface MatchEvents {
  goals: MatchEventGoal[];
  cards: MatchEventCard[];
  referees: MatchEventReferee[];
}

export async function getMatchEvents(matchId: string): Promise<MatchEvents> {
  const match = await db.match.findUnique({
    where: { id: matchId },
    select: {
      goals: {
        select: {
          id: true,
          minute: true,
          isPenalty: true,
          isOwnGoal: true,
          teamPlayer: {
            select: {
              tournamentTeam: { select: { id: true } },
              player: { select: { name: true } },
            },
          },
        },
        orderBy: { minute: "asc" },
      },
      cards: {
        select: {
          id: true,
          minute: true,
          type: true,
          reason: true,
          teamPlayer: {
            select: {
              tournamentTeam: { select: { id: true } },
              player: { select: { name: true } },
            },
          },
        },
        orderBy: { minute: "asc" },
      },
      referees: {
        select: {
          id: true,
          role: true,
          referee: { select: { name: true, certificationLevel: true } },
        },
      },
    },
  });

  return {
    goals: match?.goals ?? [],
    cards: match?.cards ?? [],
    referees: match?.referees ?? [],
  };
}
