"use client";

import { useState } from "react";
import {
  Download,
  Check,
  Share,
  MoreVertical,
  Plus,
  Rocket,
  WifiOff,
  Trophy,
  Search,
} from "lucide-react";
import { SectionBadge } from "@/components/ui-dev/section-badge";
import { GradientText } from "@/components/ui-dev/gradient-text";
import { Button } from "@/components/ui/button";
import { useInstallPrompt } from "@/components/pwa/use-install-prompt";

const benefits = [
  {
    icon: Rocket,
    title: "Abre al instante",
    desc: "Un toque desde la pantalla de inicio, sin buscar el link ni escribir la dirección.",
  },
  {
    icon: WifiOff,
    title: "Aguanta la cancha",
    desc: "Sigue mostrando lo último que viste aunque se caiga la señal en el club.",
  },
  {
    icon: Trophy,
    title: "Tabla y fixture a mano",
    desc: "Posiciones, partidos y goleadores en pantalla completa, como una app de verdad.",
  },
];

export function InstallAppSection() {
  const { canInstall, isIOS, isInstalled, promptInstall } = useInstallPrompt();
  const [showSteps, setShowSteps] = useState(false);

  const handleInstall = async () => {
    if (canInstall) {
      await promptInstall();
      return;
    }
    // Sin instalador nativo (iOS, o criterios aún no cumplidos) → mostrar pasos.
    setShowSteps(true);
  };

  return (
    <section
      id="app"
      className="relative overflow-hidden py-24 lg:py-28 bg-gradient-to-b from-white via-brand/[0.04] to-white dark:from-gray-950 dark:via-brand/[0.07] dark:to-gray-950"
    >
      {/* Glows de marca de fondo */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-brand/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-brand-2/10 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:gap-10 lg:px-8">
        {/* Columna de texto + CTA */}
        <div className="order-2 text-center lg:order-1 lg:text-left">
          <SectionBadge className="mb-6">Llevala en el celular</SectionBadge>

          <h2 className="mb-6 text-4xl font-bold leading-tight text-gray-900 dark:text-white lg:text-5xl">
            Toda la liga, <GradientText>en tu bolsillo</GradientText>
          </h2>

          <p className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-gray-600 dark:text-gray-300 lg:mx-0">
            Instalá GOLAZO como app y seguí la tabla, el fixture y los resultados
            desde la cancha. Sin tienda de apps, sin descargas pesadas: se
            agrega a tu pantalla de inicio en segundos.
          </p>

          <ul className="mb-10 space-y-5 text-left">
            {benefits.map((b) => {
              const Icon = b.icon;
              return (
                <li key={b.title} className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-mid shadow-lg shadow-brand/25">
                    <Icon className="h-5 w-5 text-white" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block font-semibold text-gray-900 dark:text-white">
                      {b.title}
                    </span>
                    <span className="block text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                      {b.desc}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>

          {/* Bloque de acción adaptativo según la plataforma */}
          <div className="space-y-4">
            {isInstalled ? (
              <div className="inline-flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-5 py-3.5 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300">
                <Check className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span className="font-semibold">
                  Ya tenés GOLAZO instalada. ¡A la cancha!
                </span>
              </div>
            ) : isIOS ? (
              <IOSSteps />
            ) : (
              <>
                <Button
                  variant="brand"
                  size="lg"
                  onClick={handleInstall}
                  className="h-12 w-full px-7 text-base sm:w-auto"
                >
                  <Download className="h-5 w-5" aria-hidden="true" />
                  Instalar app
                </Button>

                {!canInstall && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {showSteps
                      ? null
                      : "En Chrome o Edge se instala con un toque. ¿No aparece el botón?"}{" "}
                    {!showSteps && (
                      <button
                        type="button"
                        onClick={() => setShowSteps(true)}
                        className="font-medium text-brand underline underline-offset-2 hover:text-brand-hover"
                      >
                        Ver cómo
                      </button>
                    )}
                  </p>
                )}

                {showSteps && !canInstall && <GenericSteps />}
              </>
            )}

            {/* Línea de confianza */}
            <p className="pt-2 text-sm font-medium text-gray-500 dark:text-gray-400">
              Gratis
              <Dot />
              Sin Play Store
              <Dot />
              Funciona sin conexión
              <Dot />
              Menos de 1 MB
            </p>
          </div>
        </div>

        {/* Columna del mockup — señal de la sección */}
        <div className="order-1 flex justify-center lg:order-2">
          <PhonePreview />
        </div>
      </div>
    </section>
  );
}

function Dot() {
  return <span className="mx-2 text-gray-300 dark:text-gray-600">·</span>;
}

function IOSSteps() {
  const steps = [
    {
      icon: Share,
      text: (
        <>
          Tocá el botón <strong className="font-semibold">Compartir</strong> en
          la barra de Safari
        </>
      ),
    },
    {
      icon: Plus,
      text: (
        <>
          Elegí <strong className="font-semibold">Agregar a inicio</strong>
        </>
      ),
    },
    {
      icon: Check,
      text: (
        <>
          Confirmá <strong className="font-semibold">Agregar</strong> y listo
        </>
      ),
    },
  ];
  return (
    <div className="rounded-2xl border border-brand/20 bg-white/70 p-5 text-left shadow-sm backdrop-blur-sm dark:border-brand/25 dark:bg-gray-900/50">
      <p className="mb-4 font-semibold text-gray-900 dark:text-white">
        Instalá GOLAZO en tu iPhone
      </p>
      <ol className="space-y-3">
        {steps.map((s, i) => {
          const Icon = s.icon;
          return (
            <li key={i} className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand dark:bg-brand/20">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {s.text}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function GenericSteps() {
  const steps = [
    {
      icon: MoreVertical,
      text: (
        <>
          Abrí el menú del navegador (
          <strong className="font-semibold">⋮</strong>)
        </>
      ),
    },
    {
      icon: Download,
      text: (
        <>
          Elegí{" "}
          <strong className="font-semibold">
            Instalar app / Agregar a pantalla de inicio
          </strong>
        </>
      ),
    },
  ];
  return (
    <div className="mt-2 rounded-2xl border border-brand/20 bg-white/70 p-5 text-left shadow-sm backdrop-blur-sm dark:border-brand/25 dark:bg-gray-900/50">
      <ol className="space-y-3">
        {steps.map((s, i) => {
          const Icon = s.icon;
          return (
            <li key={i} className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand dark:bg-brand/20">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {s.text}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/**
 * Vista previa ilustrativa de la app en el celular (elemento de firma de la
 * sección). Es imagen de producto, no una pantalla de datos: `aria-hidden` para
 * que un lector de pantalla no lea posiciones de ejemplo como si fueran reales.
 */
function PhonePreview() {
  const rows = [
    { pos: 1, name: "Defensores", short: "DEF", pts: 15 },
    { pos: 2, name: "Talleres", short: "TAL", pts: 13 },
    { pos: 3, name: "Malvinas", short: "MAL", pts: 11 },
    { pos: 4, name: "Ateneo", short: "ATE", pts: 9 },
  ];

  return (
    <div className="relative" aria-hidden="true">
      {/* Glow bajo el teléfono */}
      <div className="absolute inset-x-6 bottom-6 top-10 rounded-[3rem] bg-brand/25 blur-3xl motion-safe:animate-[float-glow_6s_ease-in-out_infinite]" />

      <div className="relative w-[260px] rounded-[2.6rem] bg-gray-900 p-2.5 shadow-2xl ring-1 ring-black/10 dark:bg-gray-800 sm:w-[280px]">
        {/* Dynamic island */}
        <div className="absolute left-1/2 top-3.5 z-10 h-5 w-20 -translate-x-1/2 rounded-full bg-black" />

        {/* Pantalla */}
        <div className="overflow-hidden rounded-[2.1rem] bg-white">
          {/* Barra de la app */}
          <div className="flex items-center justify-between bg-gradient-to-r from-brand via-brand-mid to-brand-2 px-4 pb-3 pt-8">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-white" />
              <span className="text-base font-extrabold tracking-tight text-white">
                GOLAZO
              </span>
            </div>
            <Search className="h-4 w-4 text-white/80" />
          </div>

          {/* Contenido */}
          <div className="space-y-3 p-4">
            <div>
              <p className="text-sm font-bold text-gray-900">Apertura 2026</p>
              <p className="text-[11px] text-gray-500">Zona A · Fecha 5</p>
            </div>

            {/* Mini tabla de posiciones */}
            <div className="overflow-hidden rounded-xl border border-gray-100">
              <div className="flex items-center gap-3 bg-gray-50 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-wider text-gray-400">
                <span className="w-4">#</span>
                <span className="flex-1">Equipo</span>
                <span>Pts</span>
              </div>
              {rows.map((r) => (
                <div
                  key={r.pos}
                  className="flex items-center gap-3 border-t border-gray-50 px-3 py-2"
                >
                  <span
                    className={`w-4 text-center text-xs font-bold ${
                      r.pos === 1 ? "text-brand" : "text-gray-400"
                    }`}
                  >
                    {r.pos}
                  </span>
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand/15 to-brand-2/15 text-[9px] font-bold text-brand">
                    {r.short}
                  </span>
                  <span className="flex-1 truncate text-xs font-medium text-gray-800">
                    {r.name}
                  </span>
                  <span className="text-xs font-bold text-gray-900">
                    {r.pts}
                  </span>
                </div>
              ))}
            </div>

            {/* Card de partido en vivo */}
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
              <div className="mb-2 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 motion-safe:animate-pulse" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-red-600">
                  En vivo · 72&apos;
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-800">
                  Itatí
                </span>
                <span className="rounded-md bg-gray-900 px-2 py-0.5 text-xs font-bold text-white">
                  2 - 1
                </span>
                <span className="text-xs font-semibold text-gray-800">
                  Las Flores
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
