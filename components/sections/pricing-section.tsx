import { db } from "@/lib/db";
import { checkUser } from "@/lib/checkUser";
import {
  PricingSectionClient,
  type PlanDeVista,
} from "./pricing-section-client";

// ============================================================
// Pricing (N4/N6): planes reales leídos de la BD.
// Los límites y precios se editan en el seed o directo en la BD.
// ============================================================

export async function PricingSection() {
  const plans = await db.plan.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });

  // CTA consciente de sesión (N14d): con liga propia el destino es contratar
  // en /admin/plan (con el plan preseleccionado); sin liga, el funnel de
  // /crear-liga (que a un anónimo lo manda a registrarse, como siempre).
  const user = await checkUser();
  const hasOrg = user
    ? !!(await db.organizationMember.findFirst({
        where: { userId: user.id },
        select: { id: true },
      }))
    : false;

  const serializedPlans: PlanDeVista[] = plans.map((p) => ({
    id: p.id,
    code: p.code,
    name: p.name,
    priceMonthly: Number(p.priceMonthly),
    currency: p.currency,
    maxActiveTournaments: p.maxActiveTournaments,
    maxTeamsPerTournament: p.maxTeamsPerTournament,
    maxMembers: p.maxMembers,
    // `features` es Json en el schema: el shape lo fija PlanFeatures.
    features: (p.features ?? {}) as PlanDeVista["features"],
  }));

  return <PricingSectionClient plans={serializedPlans} hasOrg={hasOrg} />;
}
