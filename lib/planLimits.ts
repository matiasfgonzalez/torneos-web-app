import { Plan, Subscription } from "@prisma/client";
import { db } from "@/lib/db";

/**
 * Límites por plan (N4).
 *
 * Reglas (decisión D7):
 * - Toda organización tiene una Subscription; si no existe se crea con FREE.
 * - Si la suscripción venció (currentPeriodEnd < ahora) rigen los límites de
 *   FREE, pero NUNCA se ocultan datos ya cargados: solo se bloquea crear.
 * - Los límites se leen SIEMPRE del Plan (cambiar un plan afecta a todos
 *   sus clientes al instante).
 */

export type PlanAction =
  | "createTournament"
  | "addTeamToTournament"
  | "addMember";

// Estados de torneo que NO cuentan contra maxActiveTournaments
const INACTIVE_TOURNAMENT_STATUSES = [
  "FINALIZADO",
  "CANCELADO",
  "ARCHIVADO",
] as const;

async function getFreePlan(): Promise<Plan> {
  const free = await db.plan.findUnique({ where: { code: "FREE" } });
  if (!free) {
    throw new Error(
      "Plan FREE no encontrado: correr `npx prisma db seed` para crear los planes",
    );
  }
  return free;
}

/** Suscripción de la organización, creándola en FREE si no existe */
export async function getOrCreateSubscription(
  organizationId: string,
): Promise<Subscription & { plan: Plan }> {
  const existing = await db.subscription.findUnique({
    where: { organizationId },
    include: { plan: true },
  });
  if (existing) return existing;

  const free = await getFreePlan();
  return db.subscription.create({
    data: { organizationId, planId: free.id },
    include: { plan: true },
  });
}

/**
 * Plan EFECTIVO de la organización: el contratado si está vigente,
 * FREE si venció o fue cancelado.
 */
export async function getEffectivePlan(organizationId: string): Promise<Plan> {
  const subscription = await getOrCreateSubscription(organizationId);

  const expired =
    subscription.currentPeriodEnd !== null &&
    subscription.currentPeriodEnd < new Date();

  if (subscription.status === "ACTIVA" && !expired) {
    return subscription.plan;
  }

  // Marcar vencida de forma perezosa (una sola vez)
  if (subscription.status === "ACTIVA" && expired) {
    await db.subscription.update({
      where: { id: subscription.id },
      data: { status: "VENCIDA" },
    });
  }

  return getFreePlan();
}

export type PlanCheck =
  | { ok: true }
  | { ok: false; error: string; limit: number };

/**
 * Verifica si la organización puede ejecutar la acción según su plan.
 * Las rutas devuelven 402 con el mensaje cuando `ok === false`.
 */
export async function assertPlanLimit(
  organizationId: string,
  action: PlanAction,
  ctx: { tournamentId?: string } = {},
): Promise<PlanCheck> {
  const plan = await getEffectivePlan(organizationId);

  switch (action) {
    case "createTournament": {
      const count = await db.tournament.count({
        where: {
          organizationId,
          deletedAt: null,
          status: { notIn: [...INACTIVE_TOURNAMENT_STATUSES] },
        },
      });
      if (count >= plan.maxActiveTournaments) {
        return {
          ok: false,
          limit: plan.maxActiveTournaments,
          error: `Tu plan ${plan.name} permite hasta ${plan.maxActiveTournaments} torneo(s) activo(s). Finalizá o archivá un torneo, o mejorá tu plan.`,
        };
      }
      return { ok: true };
    }

    case "addTeamToTournament": {
      if (!ctx.tournamentId) return { ok: true };
      const count = await db.tournamentTeam.count({
        where: { tournamentId: ctx.tournamentId },
      });
      if (count >= plan.maxTeamsPerTournament) {
        return {
          ok: false,
          limit: plan.maxTeamsPerTournament,
          error: `Tu plan ${plan.name} permite hasta ${plan.maxTeamsPerTournament} equipos por torneo. Mejorá tu plan para agregar más.`,
        };
      }
      return { ok: true };
    }

    case "addMember": {
      const count = await db.organizationMember.count({
        where: { organizationId },
      });
      if (count >= plan.maxMembers) {
        return {
          ok: false,
          limit: plan.maxMembers,
          error: `Tu plan ${plan.name} permite hasta ${plan.maxMembers} miembro(s). Mejorá tu plan para invitar más.`,
        };
      }
      return { ok: true };
    }
  }
}

/** ¿El plan efectivo incluye la feature? (exportPdf, customBranding, liveMatch) */
export async function hasFeature(
  organizationId: string,
  feature: string,
): Promise<boolean> {
  const plan = await getEffectivePlan(organizationId);
  const features = plan.features as Record<string, boolean> | null;
  return features?.[feature] === true;
}
