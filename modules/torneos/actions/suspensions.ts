"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireActionOrgAccess } from "@/lib/orgAuth";
import { recomputeTournamentSuspensions } from "@/lib/suspensions/engine";

export interface SuspensionView {
  id: string;
  reason: "ACUMULACION" | "ROJA" | "MANUAL";
  totalMatches: number;
  servedMatches: number;
  matchesRemaining: number;
  notes: string | null;
  isActive: boolean;
  player: { name: string; imageUrl: string | null };
  team: { name: string; logoUrl: string | null };
  teamPlayerId: string;
}

const REASON_ORDER = { ROJA: 0, ACUMULACION: 1, MANUAL: 2 } as const;

/**
 * Suspensiones de un torneo para la vista "Sancionados" (pública y admin).
 * Por defecto solo las activas; `includeServed` trae también las cumplidas.
 */
export async function getTournamentSuspensions(
  tournamentId: string,
  opts: { includeServed?: boolean } = {},
): Promise<SuspensionView[]> {
  const suspensions = await db.suspension.findMany({
    where: {
      tournamentId,
      ...(opts.includeServed ? {} : { isActive: true }),
    },
    include: {
      teamPlayer: {
        include: {
          player: { select: { name: true, imageUrl: true } },
          tournamentTeam: {
            include: { team: { select: { name: true, logoUrl: true } } },
          },
        },
      },
    },
  });

  return suspensions
    .map((s) => ({
      id: s.id,
      reason: s.reason,
      totalMatches: s.totalMatches,
      servedMatches: s.servedMatches,
      matchesRemaining: Math.max(0, s.totalMatches - s.servedMatches),
      notes: s.notes,
      isActive: s.isActive,
      teamPlayerId: s.teamPlayerId,
      player: {
        name: s.teamPlayer.player.name,
        imageUrl: s.teamPlayer.player.imageUrl,
      },
      team: {
        name: s.teamPlayer.tournamentTeam.team.name,
        logoUrl: s.teamPlayer.tournamentTeam.team.logoUrl,
      },
    }))
    .sort(
      (a, b) =>
        REASON_ORDER[a.reason] - REASON_ORDER[b.reason] ||
        a.team.name.localeCompare(b.team.name),
    );
}

/**
 * Crea una suspensión MANUAL (decisión del organizador; roles gestores, no
 * colaboradores). Rige desde ahora: la cumplen los próximos partidos del equipo.
 */
export async function createManualSuspension(data: {
  teamPlayerId: string;
  totalMatches: number;
  notes?: string;
}): Promise<{ success: boolean; error?: string }> {
  const teamPlayer = await db.teamPlayer.findUnique({
    where: { id: data.teamPlayerId },
    select: {
      tournamentTeam: {
        select: { tournamentId: true, tournament: { select: { organizationId: true } } },
      },
    },
  });
  if (!teamPlayer) return { success: false, error: "Jugador no encontrado" };

  const auth = await requireActionOrgAccess(
    teamPlayer.tournamentTeam.tournament.organizationId,
  );
  if (auth.error) return { success: false, error: auth.error };

  if (!Number.isInteger(data.totalMatches) || data.totalMatches < 1) {
    return { success: false, error: "La cantidad de fechas debe ser al menos 1" };
  }

  const tournamentId = teamPlayer.tournamentTeam.tournamentId;

  await db.suspension.create({
    data: {
      teamPlayerId: data.teamPlayerId,
      tournamentId,
      reason: "MANUAL",
      totalMatches: data.totalMatches,
      triggerDate: new Date(),
      notes: data.notes?.trim() || null,
    },
  });

  // Recalcular fechas cumplidas (por si el equipo ya tiene partidos posteriores)
  await recomputeTournamentSuspensions(tournamentId);

  revalidatePath(`/admin/torneos/${tournamentId}`);
  return { success: true };
}

/**
 * Cancela una suspensión MANUAL (la borra). Las automáticas (ACUMULACION/ROJA)
 * se gestionan a través de las tarjetas: eliminá la tarjeta que las originó.
 */
export async function cancelManualSuspension(
  suspensionId: string,
): Promise<{ success: boolean; error?: string }> {
  const suspension = await db.suspension.findUnique({
    where: { id: suspensionId },
    select: {
      reason: true,
      tournamentId: true,
      tournament: { select: { organizationId: true } },
    },
  });
  if (!suspension) return { success: false, error: "Suspensión no encontrada" };

  if (suspension.reason !== "MANUAL") {
    return {
      success: false,
      error:
        "Solo se cancelan suspensiones manuales. Las automáticas se quitan eliminando la tarjeta que las originó.",
    };
  }

  const auth = await requireActionOrgAccess(
    suspension.tournament.organizationId,
  );
  if (auth.error) return { success: false, error: auth.error };

  await db.suspension.delete({ where: { id: suspensionId } });

  revalidatePath(`/admin/torneos/${suspension.tournamentId}`);
  return { success: true };
}
