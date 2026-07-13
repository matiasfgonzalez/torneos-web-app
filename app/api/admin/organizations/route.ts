import { db } from "@/lib/db";
import { validateApiRole } from "@/lib/apiRoleValidation";
import { apiError, apiOk } from "@/lib/apiResponse";
import { getEffectivePlan } from "@/lib/planLimits";

/**
 * GET /api/admin/organizations — listado de organizaciones para el admin de
 * plataforma (N10): plan efectivo, estado de suscripción, último pago y
 * uso actual. Solo ADMINISTRADOR.
 */
export async function GET() {
  const { error } = await validateApiRole(["ADMINISTRADOR"]);
  if (error) return error;

  try {
    const organizations = await db.organization.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        subscription: {
          include: {
            plan: { select: { code: true, name: true } },
            payments: {
              orderBy: { createdAt: "desc" },
              take: 1,
              select: {
                amount: true,
                currency: true,
                status: true,
                createdAt: true,
              },
            },
          },
        },
        _count: {
          select: {
            members: true,
            tournaments: { where: { deletedAt: null } },
          },
        },
      },
    });

    const data = await Promise.all(
      organizations.map(async (org) => {
        const effectivePlan = await getEffectivePlan(org.id);
        return {
          id: org.id,
          name: org.name,
          slug: org.slug,
          locality: org.locality,
          status: org.status,
          createdAt: org.createdAt,
          members: org._count.members,
          tournaments: org._count.tournaments,
          effectivePlan: { code: effectivePlan.code, name: effectivePlan.name },
          subscription: org.subscription
            ? {
                status: org.subscription.status,
                currentPeriodEnd: org.subscription.currentPeriodEnd,
                contractedPlan: org.subscription.plan.name,
              }
            : null,
          lastPayment: org.subscription?.payments[0]
            ? {
                amount: org.subscription.payments[0].amount,
                currency: org.subscription.payments[0].currency,
                status: org.subscription.payments[0].status,
                createdAt: org.subscription.payments[0].createdAt,
              }
            : null,
        };
      }),
    );

    return apiOk(data);
  } catch (err) {
    console.error("Error al listar organizaciones:", err);
    return apiError(500, "Error al listar organizaciones");
  }
}
