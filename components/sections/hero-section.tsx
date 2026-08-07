"use client";

import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  Globe,
  Sparkles,
  Trophy,
} from "lucide-react";
import LightPillar from "@/components/reactbits/LightPillar";
import { FadeInSection } from "@/components/ui-dev/scroll-animations";

/**
 * Tabla de posiciones de demostración del hero (F1): los `<img>` anteriores
 * hotlinkeaban los escudos desde un sitio de terceros que la CSP (C9,
 * `img-src`) bloquea — se veían rotos. Ahora usan las copias locales de
 * `public/escudos/` vía next/image ('self' permitido por la CSP).
 */
const DEMO_STANDINGS = [
  { pos: 1, name: "CSD Talleres", shield: "/escudos/talleres.png", points: 45 },
  { pos: 2, name: "CSD Ateneo", shield: "/escudos/ateneo.png", points: 42 },
  {
    pos: 3,
    name: "CA Vizcaya",
    shield: "/escudos/nueva_vizcaya.png",
    points: 38,
  },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden min-h-[90dvh] flex items-center bg-[#120F17]">
      {/* LightPillar WebGL Background */}
      <LightPillar
        topColor="#5227FF"
        bottomColor="#FF9FFC"
        intensity={1}
        rotationSpeed={0.3}
        glowAmount={0.005}
        pillarWidth={3}
        pillarHeight={0.4}
        noiseIntensity={0.5}
        pillarRotation={25}
        interactive={false}
        mixBlendMode="screen"
        quality="high"
      />

      {/* Velo sobre el pilar de luz. No es decoración: el haz llega a un magenta
          muy claro y el texto blanco encima quedaba por debajo del contraste
          mínimo, sobre todo en mobile, donde el pilar ocupa toda la pantalla.
          En mobile oscurece parejo; en desktop cae hacia la derecha, así la
          columna de texto queda apoyada en fondo oscuro y la card de la derecha
          conserva el brillo. */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none bg-[#120F17]/55 lg:bg-gradient-to-r lg:from-[#120F17]/85 lg:via-[#120F17]/45 lg:to-transparent"
        aria-hidden="true"
      />

      {/* Gradient overlay at bottom for smooth transition to rest of page */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#120F17] to-transparent z-[1] pointer-events-none" />

      <div className="relative z-[2] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column — Copy */}
          <FadeInSection direction="left" delay={0.1}>
            <div className="space-y-10">
              {/* Badge premium con efecto glow */}
              <div className="inline-flex">
                <Badge className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-4 py-2 text-sm font-medium shadow-lg shadow-brand/15 hover:bg-white/15 transition-all duration-300 animate-shimmer">
                  <Sparkles className="w-4 h-4 mr-2 text-brand-2" />
                  Del fixture a la tabla, sin planillas
                </Badge>
              </div>

              {/* Título épico */}
              <div className="space-y-6">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-extrabold text-white leading-[1.05] tracking-tight">
                  Gestiona Torneos{" "}
                  <span className="block mt-2">
                    Como un{" "}
                    <span className="relative inline-block">
                      <span className="bg-gradient-to-r from-brand via-brand-mid to-brand-2 bg-clip-text text-transparent animate-gradient-shift bg-[length:200%_auto]">
                        Profesional
                      </span>
                      <svg
                        className="absolute -bottom-2 left-0 w-full"
                        height="8"
                        viewBox="0 0 200 8"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M1 5.5C47.6667 2.16667 141 -2.4 199 5.5"
                          stroke="url(#hero-underline-gradient)"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                        <defs>
                          <linearGradient
                            id="hero-underline-gradient"
                            x1="0"
                            y1="0"
                            x2="200"
                            y2="0"
                          >
                            <stop stopColor="var(--brand)" />
                            <stop offset="1" stopColor="var(--brand-2)" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </span>
                  </span>
                </h1>
                <p className="text-xl lg:text-2xl text-gray-100 leading-relaxed max-w-xl drop-shadow-[0_1px_8px_rgba(18,15,23,0.9)]">
                  La plataforma integral para organizar torneos con{" "}
                  <span className="font-semibold text-white">
                    tablas en tiempo real
                  </span>
                  , gestión de equipos y contenido multimedia.
                </p>
              </div>

              {/* CTAs con diseño premium */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/crear-liga"
                  className="group relative inline-flex items-center justify-center text-lg px-8 py-4 rounded-xl font-semibold bg-gradient-to-r from-brand to-brand-2 text-white shadow-2xl shadow-brand/30 hover:shadow-brand/50 transition-all duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#120F17] overflow-hidden"
                >
                  {/* Glow pulse behind button */}
                  <span className="absolute inset-0 bg-gradient-to-r from-brand to-brand-2 blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                  <span className="relative flex items-center">
                    <Trophy className="w-5 h-5 mr-2" />
                    Creá tu liga gratis
                  </span>
                </Link>
                <Link
                  href="/torneos"
                  className="group inline-flex items-center justify-center text-lg px-8 py-4 rounded-xl font-semibold border border-white/25 text-white hover:bg-white/10 backdrop-blur-sm bg-white/5 transition-all duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#120F17]"
                >
                  Ver torneos
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Tres pruebas de lo que la plataforma hace de verdad.
                  Acá había tres contadores animados ("10K+ torneos activos",
                  "50K+ equipos", "99.9% uptime") que no salían de ningún lado:
                  la base tiene dos dígitos de torneos y no hay ningún SLA
                  firmado. Una cifra inventada en el primer scroll es la forma
                  más rápida de perder la confianza que la landing viene a
                  ganar; estas tres afirmaciones sí se pueden verificar entrando
                  al producto. */}
              <ul className="grid grid-cols-1 sm:grid-cols-3 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 pt-0">
                {[
                  {
                    icon: BarChart3,
                    title: "Tabla automática",
                    desc: "Se recalcula sola con cada resultado",
                  },
                  {
                    icon: CalendarDays,
                    title: "Fixture en un clic",
                    desc: "Liga, grupos o eliminación directa",
                  },
                  {
                    icon: Globe,
                    title: "Página pública",
                    desc: "Tu liga con dirección propia",
                  },
                ].map((item) => (
                  <li
                    key={item.title}
                    className="bg-[#120F17]/60 px-4 py-4 backdrop-blur-sm"
                  >
                    <item.icon
                      className="mb-2 h-5 w-5 text-brand-2"
                      aria-hidden="true"
                    />
                    <p className="text-sm font-semibold text-white">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-xs leading-snug text-gray-300">
                      {item.desc}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </FadeInSection>

          {/* Right Column — Demo Card */}
          <FadeInSection direction="right" delay={0.3}>
            <div className="relative lg:pl-8">
              {/* Card flotante con glassmorphism premium */}
              <div className="relative">
                {/* Glow effect detrás de la card */}
                <div className="absolute inset-0 bg-gradient-to-r from-brand/30 to-brand-2/30 rounded-3xl blur-2xl transform scale-95 animate-glow-pulse" />

                <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 hover:border-white/30 transition-colors duration-500">
                  {/* Header de la card */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-brand to-brand-2 rounded-xl flex items-center justify-center shadow-lg shadow-brand/25">
                        <Trophy className="w-5 h-5 text-white" aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white">
                          Copa de Verano 2026
                        </h3>
                        <p className="text-sm text-gray-300">
                          5ª Edición
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 px-3 py-1">
                      <span className="relative flex h-2 w-2 mr-2">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 motion-safe:animate-ping" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                      </span>
                      En Vivo
                    </Badge>
                  </div>

                  {/* Tabla de posiciones */}
                  <div className="space-y-3">
                    {DEMO_STANDINGS.map((team) =>
                      team.pos === 1 ? (
                        <div
                          key={team.pos}
                          className="flex items-center justify-between p-4 bg-gradient-to-r from-brand/15 to-brand-2/15 rounded-2xl border border-brand/25"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 bg-gradient-to-r from-brand to-brand-2 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-brand/30">
                              {team.pos}
                            </div>
                            <Image
                              src={team.shield}
                              alt={`Escudo de ${team.name}`}
                              width={44}
                              height={44}
                              className="object-cover rounded-xl shadow-md"
                            />
                            <span className="font-semibold text-white">
                              {team.name}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold bg-gradient-to-r from-brand to-brand-2 bg-clip-text text-transparent">
                              {team.points}
                            </div>
                            <div className="text-xs text-gray-400 uppercase tracking-wide">
                              puntos
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div
                          key={team.pos}
                          className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-gray-300 font-bold text-sm">
                              {team.pos}
                            </div>
                            <Image
                              src={team.shield}
                              alt={`Escudo de ${team.name}`}
                              width={44}
                              height={44}
                              className="object-cover rounded-xl shadow-md"
                            />
                            <span className="font-medium text-gray-200">
                              {team.name}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-gray-200">
                              {team.points}
                            </div>
                            <div className="text-xs text-gray-400 uppercase tracking-wide">
                              puntos
                            </div>
                          </div>
                        </div>
                      ),
                    )}
                  </div>

                  {/* Footer de la card */}
                  <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                    <span className="text-sm text-gray-400">
                      Actualizado en tiempo real
                    </span>
                    <Link
                      href="/torneos"
                      className="group/link flex items-center gap-1 rounded text-sm font-medium text-brand-2 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#120F17]"
                    >
                      Ver torneo completo
                      <ArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-0.5" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Elementos decorativos flotantes */}
              <div className="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-r from-brand to-brand-2 rounded-2xl opacity-20 rotate-12 blur-sm" />
              <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-gradient-to-r from-brand-2 to-brand rounded-full opacity-20 blur-sm" />
            </div>
          </FadeInSection>
        </div>
      </div>
    </section>
  );
}
