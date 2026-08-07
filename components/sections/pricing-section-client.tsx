"use client";

import Link from "next/link";
import { GradientText } from "@/components/ui-dev/gradient-text";
import { Check, Sparkles, Shield, Clock } from "lucide-react";
import { FadeInSection, StaggerContainer, StaggerItem } from "@/components/ui-dev/scroll-animations";

interface PlanFeatures {
  exportPdf?: boolean;
  customBranding?: boolean;
  liveMatch?: boolean;
  orgNews?: boolean;
}

/**
 * El plan tal como cruza de server a cliente: ya serializado (`priceMonthly`
 * pasa de Decimal a number) y con `features` tipado. Antes era `any[]`, que
 * dejaba pasar cualquier campo mal escrito sin que el compilador dijera nada.
 */
export interface PlanDeVista {
  id: string;
  code: string;
  name: string;
  priceMonthly: number;
  currency: string;
  maxActiveTournaments: number;
  maxTeamsPerTournament: number;
  maxMembers: number;
  features: PlanFeatures;
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
  // El plan gratuito se llama "Gratis", así que devolver "Gratis" también como
  // precio dejaba la palabra dos veces en la misma tarjeta, una arriba de la
  // otra. El cero explícito se lee igual de claro y alinea con las otras dos.
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

/** A partir de este valor, el límite del plan se comunica como "sin límite". */
const SIN_LIMITE = 999;

/**
 * Frase de un límite del plan.
 *
 * **La versión ilimitada NO es "poner la palabra ilimitados donde iba el
 * número".** Eso es lo que hacía antes y salían frases rotas en la card más
 * cara de la página: *"Hasta ilimitados equipos por torneo"*, *"ilimitados
 * torneos activos"* (en minúscula, arrancando el ítem). Cada caso necesita su
 * redacción, así que se arma la frase entera, no el pedacito del medio.
 */
function limite(
  cantidad: number,
  { singular, plural, ilimitado }: { singular: string; plural: string; ilimitado: string },
): string {
  if (cantidad >= SIN_LIMITE) return ilimitado;
  return `${cantidad} ${cantidad === 1 ? singular : plural}`;
}

function planBullets(plan: {
  maxActiveTournaments: number;
  maxTeamsPerTournament: number;
  maxMembers: number;
  features: PlanFeatures;
}): string[] {
  const bullets = [
    limite(plan.maxActiveTournaments, {
      singular: "torneo activo",
      plural: "torneos activos",
      ilimitado: "Torneos activos ilimitados",
    }),
    limite(plan.maxTeamsPerTournament, {
      singular: "equipo por torneo",
      plural: "equipos por torneo",
      ilimitado: "Sin límite de equipos por torneo",
    }),
    limite(plan.maxMembers, {
      singular: "miembro en tu equipo de trabajo",
      plural: "miembros en tu equipo de trabajo",
      ilimitado: "Equipo de trabajo sin límite de miembros",
    }),
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

interface PricingSectionClientProps {
  plans: PlanDeVista[];
  hasOrg: boolean;
}

export function PricingSectionClient({
  plans,
  hasOrg,
}: Readonly<PricingSectionClientProps>) {
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
        <FadeInSection>
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
        </FadeInSection>

        {/* Grid de planes */}
        <StaggerContainer className="grid gap-8 lg:grid-cols-3 lg:items-stretch max-w-5xl mx-auto">
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
              features: plan.features ?? {},
            });

            return (
              <StaggerItem key={plan.id}>
                {/* Envoltorio `relative` sin recorte: el badge "Más elegido"
                    sobresale por arriba de la card, y la card destacada necesita
                    `overflow-hidden` para recortar su borde giratorio. Si el
                    badge vive adentro, ese mismo recorte se lo come por la
                    mitad — que era lo que pasaba. */}
                <div className="relative h-full pt-4">
                  {isHighlight && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10">
                      <div className="relative flex items-center gap-1.5 overflow-hidden whitespace-nowrap rounded-full bg-gradient-to-r from-brand to-brand-2 px-5 py-1.5 text-xs font-semibold text-white shadow-lg shadow-brand/25">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-sheen" />
                        <Sparkles className="relative z-10 h-3.5 w-3.5" aria-hidden="true" />
                        <span className="relative z-10">Más elegido</span>
                      </div>
                    </div>
                  )}

                  <div
                    className={`relative flex h-full flex-col rounded-3xl transition-all duration-300 ${
                      isHighlight
                        ? "shadow-2xl shadow-brand/15 lg:scale-[1.03] overflow-hidden"
                        : "border border-gray-100 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 hover:border-brand/40 hover:shadow-xl"
                    }`}
                  >
                  {isHighlight && (
                    <div className="absolute inset-[-100%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,var(--brand)_50%,transparent_100%)]" />
                  )}

                  <div className={`relative flex flex-col flex-1 p-8 ${isHighlight ? 'bg-white dark:bg-gray-800 rounded-[calc(1.5rem-1px)] m-[1px]' : 'rounded-3xl h-full'}`}>
                    <div className="mb-6 mt-2">
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
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        {/* Trust badges */}
        <FadeInSection>
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
        </FadeInSection>

        {/* FAQ */}
        <FadeInSection>
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
        </FadeInSection>
      </div>
    </section>
  );
}
