import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkUser } from "@/lib/checkUser";
import { getOrCreateOwnOrg } from "@/lib/orgAuth";
import {
  getEffectivePlan,
  getOrCreateSubscription,
} from "@/lib/planLimits";
import { apiError } from "@/lib/apiResponse";

/**
 * GET /api/org/subscription — estado del plan de la organización del usuario:
 * plan contratado, plan efectivo (FREE si venció), vencimiento y uso actual.
 */
export async function GET() {
  try {
    const user = await checkUser();
    if (!user) {
      return apiError(401, "Debes iniciar sesión");
    }

    const org = await getOrCreateOwnOrg(user);
    const subscription = await getOrCreateSubscription(org.id);
    const effectivePlan = await getEffectivePlan(org.id);

    const [activeTournaments, members] = await Promise.all([
      db.tournament.count({
        where: {
          organizationId: org.id,
          deletedAt: null,
          status: { notIn: ["FINALIZADO", "CANCELADO", "ARCHIVADO"] },
        },
      }),
      db.organizationMember.count({ where: { organizationId: org.id } }),
    ]);

    return NextResponse.json({
      organization: { id: org.id, name: org.name, slug: org.slug },
      subscription: {
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
        contractedPlan: {
          code: subscription.plan.code,
          name: subscription.plan.name,
        },
      },
      effectivePlan: {
        code: effectivePlan.code,
        name: effectivePlan.name,
        maxActiveTournaments: effectivePlan.maxActiveTournaments,
        maxTeamsPerTournament: effectivePlan.maxTeamsPerTournament,
        maxMembers: effectivePlan.maxMembers,
        features: effectivePlan.features,
      },
      usage: {
        activeTournaments,
        members,
      },
    });
  } catch (error) {
    console.error("Error al obtener suscripción:", error);
    return apiError(500, "Error al obtener la suscripción");
  }
}
