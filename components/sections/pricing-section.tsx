import Link from "next/link";
import { db } from "@/lib/db";
import { checkUser } from "@/lib/checkUser";
import { GradientText } from "@/components/ui-dev/gradient-text";
import { Check, Sparkles, Shield, Clock } from "lucide-react";

// ============================================================
// Pricing (N4/N6): planes reales leídos de la BD.
// Los límites y precios se editan en el seed o directo en la BD.
// ============================================================

interface PlanFeatures {
  exportPdf?: boolean;
  customBranding?: boolean;
  liveMatch?: boolean;
  orgNews?: boolean;
}

const HIGHLIGHT_CODE = "PRO";

const CTA_BY_CODE: Record<string, string> = {
  FREE: "Empezá gratis",
  PRO: "Elegir Pro",
  PREMIUM: "Elegir Premium",
};

const TAGLINE_BY_CODE: Record<string, string> = {
  FREE: "Para probar con tu primer torneo",
  PRO: "Para ligas en marcha",
  PREMIUM: "Para ligas grandes y con marca propia",
};

function formatPrice(price: number, currency: string): string {
  if (price === 0) return "Gratis";
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

function unlimited(n: number): string {
  return n >= 999 ? "ilimitados" : String(n);
}

// Construye los bullets legibles a partir de los límites del plan
function planBullets(plan: {
  maxActiveTournaments: number;
  maxTeamsPerTournament: number;
  maxMembers: number;
  features: PlanFeatures;
}): string[] {
  const bullets = [
    `${unlimited(plan.maxActiveTournaments)} ${plan.maxActiveTournaments === 1 ? "torneo activo" : "torneos activos"}`,
    `Hasta ${unlimited(plan.maxTeamsPerTournament)} equipos por torneo`,
    `${unlimited(plan.maxMembers)} ${plan.maxMembers === 1 ? "miembro" : "miembros"} en tu equipo de trabajo`,
    "Tabla de posiciones y estadísticas en vivo",
    "Páginas públicas de torneos, equipos y jugadores",
  ];
  if (plan.features.exportPdf) bullets.push("Exportar fixture y tabla a PDF");
  if (plan.features.customBranding)
    bullets.push("Marca propia de tu liga (sin “Powered by GOLAZO”)");
  if (plan.features.liveMatch) bullets.push("Centro de partido en vivo");
  if (plan.features.orgNews)
    bullets.push("Novedades de la liga en tu página pública");
  return bullets;
}

const FAQ: { q: string; a: string }[] = [
  {
    q: "¿Necesito tarjeta de crédito para empezar?",
    a: "No. Creás tu liga y tu primer torneo con el plan Gratis sin ingresar ningún dato de pago. Solo pagás si decidís mejorar tu plan.",
  },
  {
    q: "¿El plan Gratis vence?",
    a: "No vence. Podés usar el plan Gratis todo el tiempo que quieras con 1 torneo activo. Cuando necesites más torneos o funciones, mejorás tu plan.",
  },
  {
    q: "¿Cómo se paga?",
    a: "Por transferencia o efectivo: subís el comprobante desde tu panel y lo aprobamos para activar tu plan. Muy pronto vas a poder pagar también con Mercado Pago.",
  },
  {
    q: "¿Puedo invitar a otras personas a gestionar mi liga?",
    a: "Sí. Invitás organizadores (gestión completa) y colaboradores (solo carga de resultados, ideal para planilleros) por email. La cantidad depende de tu plan.",
  },
  {
    q: "¿Qué pasa con mis datos si dejo de pagar?",
    a: "Nunca se borran. Si tu plan vence, volvés a los límites del plan Gratis, pero todos tus torneos, equipos y estadísticas quedan intactos y visibles.",
  },
];

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

  return (
    <section
      id="precios"
      className="relative py-24 bg-white dark:bg-gray-900 overflow-hidden"
    >
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-brand/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-brand-2/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand mb-4">
            Planes simples y transparentes
          </p>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Empezá gratis, <GradientText>crecé cuando quieras</GradientText>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Creá tu liga sin costo. Pagás solo cuando necesitás más torneos,
            más equipo de trabajo o funciones premium.
          </p>
        </div>

        {/* Grid de planes */}
        <div className="grid gap-8 lg:grid-cols-3 lg:items-stretch max-w-5xl mx-auto">
          {plans.map((plan) => {
            const isHighlight = plan.code === HIGHLIGHT_CODE;
            const price = Number(plan.priceMonthly);
            // Con liga: contratar en el panel con el plan preseleccionado;
            // FREE ya lo tiene (o es su fallback) → ver su plan, sin query.
            const ctaHref = hasOrg
              ? price > 0
                ? `/admin/plan?plan=${plan.code}`
                : "/admin/plan"
              : "/crear-liga";
            const ctaLabel =
              hasOrg && price === 0
                ? "Ver mi plan"
                : (CTA_BY_CODE[plan.code] ?? "Empezar");
            const bullets = planBullets({
              maxActiveTournaments: plan.maxActiveTournaments,
              maxTeamsPerTournament: plan.maxTeamsPerTournament,
              maxMembers: plan.maxMembers,
              features: (plan.features as PlanFeatures) ?? {},
            });

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-3xl border p-8 transition-all duration-300 ${
                  isHighlight
                    ? "border-brand bg-white dark:bg-gray-800 shadow-2xl shadow-brand/15 lg:scale-[1.03]"
                    : "border-gray-100 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 hover:border-brand/40 hover:shadow-xl"
                }`}
              >
                {isHighlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="bg-gradient-to-r from-brand to-brand-2 text-white px-5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-brand/25 whitespace-nowrap">
                      <Sparkles className="w-3.5 h-3.5" />
                      Más elegido
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 min-h-[2.5rem]">
                    {TAGLINE_BY_CODE[plan.code] ?? ""}
                  </p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span
                      className={`text-4xl font-bold ${
                        isHighlight
                          ? "bg-gradient-to-r from-brand to-brand-2 bg-clip-text text-transparent"
                          : "text-gray-900 dark:text-white"
                      }`}
                    >
                      {formatPrice(price, plan.currency)}
                    </span>
                    {price > 0 && (
                      <span className="text-gray-500 dark:text-gray-400">
                        /mes
                      </span>
                    )}
                  </div>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 mt-0.5 bg-gradient-to-r from-brand/10 to-brand-2/10 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-brand" />
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {bullet}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={ctaHref}
                  className={`inline-flex items-center justify-center w-full py-3 rounded-xl font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand/50 ${
                    isHighlight
                      ? "bg-gradient-to-r from-brand to-brand-2 hover:from-brand-hover hover:to-brand-mid-hover text-white shadow-lg shadow-brand/25"
                      : "border border-brand text-brand hover:bg-brand hover:text-white"
                  }`}
                >
                  {ctaLabel}
                </Link>
              </div>
            );
          })}
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-8 mt-16">
          <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-brand" />
            </div>
            <span className="font-medium">Sin tarjeta de crédito</span>
          </div>
          <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 text-brand" />
            </div>
            <span className="font-medium">Plan gratis para siempre</span>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mt-24">
          <h3 className="text-2xl lg:text-3xl font-bold text-center text-gray-900 dark:text-white mb-10">
            Preguntas frecuentes
          </h3>
          <div className="space-y-4">
            {FAQ.map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800/60 p-5 [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex items-center justify-between cursor-pointer list-none font-semibold text-gray-900 dark:text-white">
                  {item.q}
                  <span className="ml-4 flex-shrink-0 text-brand transition-transform duration-300 group-open:rotate-45 text-2xl leading-none">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
