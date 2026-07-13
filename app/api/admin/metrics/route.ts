import { db } from "@/lib/db";
import { validateApiRole } from "@/lib/apiRoleValidation";
import { apiError, apiOk } from "@/lib/apiResponse";

/**
 * GET /api/admin/metrics — métricas SaaS para el admin de plataforma (N10):
 * organizaciones por estado, distribución de planes (conversión FREE→pago),
 * ingresos aprobados del mes en curso y torneos creados. Solo ADMINISTRADOR.
 */
export async function GET() {
  const { error } = await validateApiRole(["ADMINISTRADOR"]);
  if (error) return error;

  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthAgo = new Date(now);
    monthAgo.setDate(monthAgo.getDate() - 30);

    const [
      totalOrgs,
      activeOrgs,
      suspendedOrgs,
      subscriptionsByPlan,
      revenueThisMonth,
      tournamentsTotal,
      tournamentsThisMonth,
      newOrgsThisMonth,
    ] = await Promise.all([
      db.organization.count(),
      db.organization.count({ where: { status: "ACTIVA" } }),
      db.organization.count({ where: { status: "SUSPENDIDA" } }),
      db.subscription.groupBy({
        by: ["planId"],
        _count: { _all: true },
      }),
      db.payment.aggregate({
        where: { status: "APROBADO", createdAt: { gte: monthStart } },
        _sum: { amount: true },
      }),
      db.tournament.count({ where: { deletedAt: null } }),
      db.tournament.count({
        where: { deletedAt: null, createdAt: { gte: monthStart } },
      }),
      db.organization.count({ where: { createdAt: { gte: monthAgo } } }),
    ]);

    const plans = await db.plan.findMany({
      select: { id: true, code: true, name: true },
    });
    const planCountById = new Map(
      subscriptionsByPlan.map((s) => [s.planId, s._count._all]),
    );
    const planDistribution = plans.map((plan) => ({
      code: plan.code,
      name: plan.name,
      count: planCountById.get(plan.id) ?? 0,
    }));

    const paidSubscriptions = planDistribution
      .filter((p) => p.code !== "FREE")
      .reduce((sum, p) => sum + p.count, 0);
    const freeSubscriptions =
      planDistribution.find((p) => p.code === "FREE")?.count ?? 0;
    const totalSubscriptions = paidSubscriptions + freeSubscriptions;
    const conversionRate =
      totalSubscriptions > 0
        ? Math.round((paidSubscriptions / totalSubscriptions) * 1000) / 10
        : 0;

    return apiOk({
      organizations: {
        total: totalOrgs,
        active: activeOrgs,
        suspended: suspendedOrgs,
        newLast30Days: newOrgsThisMonth,
      },
      plans: {
        distribution: planDistribution,
        conversionRate,
      },
      revenue: {
        thisMonth: revenueThisMonth._sum.amount ?? 0,
        currency: "ARS",
      },
      tournaments: {
        total: tournamentsTotal,
        thisMonth: tournamentsThisMonth,
      },
    });
  } catch (err) {
    console.error("Error al calcular métricas:", err);
    return apiError(500, "Error al calcular métricas");
  }
}
