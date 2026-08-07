"use client";

import Link from "next/link";
import { ArrowRight, ClipboardList, Share2, Trophy } from "lucide-react";

import { GradientText } from "@/components/ui-dev/gradient-text";
import {
  FadeInSection,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui-dev/scroll-animations";

/**
 * "Cómo empezás" — los tres pasos reales para tener una liga andando.
 *
 * **Reemplaza a la sección de testimonios**, que mostraba tres citas firmadas
 * por personas que no existen ("Carlos Mendoza, Director Liga Regional") junto
 * a cifras presentadas como hechos verificados: *4,9/5*, *500+ reseñas
 * verificadas*, *98% de satisfacción*. Ninguna salía de ningún lado. Inventar
 * reseñas no es una licencia de marketing: es exactamente lo que un visitante
 * no puede perdonar si lo descubre, y en varios países es publicidad engañosa.
 *
 * Se eligió un flujo de tres pasos y no otra grilla de features porque acá la
 * numeración **significa algo**: es una secuencia real, en ese orden, y el
 * visitante que llega hasta esta altura de la página ya sabe qué hace el
 * producto — lo que le falta saber es cuánto trabajo le va a costar empezar.
 *
 * Los testimonios reales entran acá el día que existan: la estructura de tres
 * tarjetas es la misma (ver TODO.md).
 */

const PASOS = [
  {
    icon: Trophy,
    titulo: "Creá tu liga",
    texto:
      "Registrate y dale un nombre. Queda con dirección propia desde el primer minuto, sin tarjeta ni instalación.",
  },
  {
    icon: ClipboardList,
    titulo: "Cargá equipos y fixture",
    texto:
      "Sumá los equipos, elegí el formato y el fixture se genera solo: todos contra todos, grupos o eliminación directa.",
  },
  {
    icon: Share2,
    titulo: "Compartí y cargá resultados",
    texto:
      "Pasás el link y listo. Con cada resultado la tabla, las estadísticas y los goleadores se actualizan solos.",
  },
];

export function HowItWorksSection() {
  return (
    <section
      id="como-funciona"
      className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-white py-24 dark:from-gray-900 dark:to-gray-800"
    >
      {/* Elementos decorativos */}
      <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-brand/5 blur-3xl" />
      <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-brand-2/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeInSection>
          <div className="mx-auto mb-20 max-w-3xl text-center">
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-brand">
              Cómo funciona
            </p>
            <h2 className="mb-6 text-4xl font-bold text-gray-900 dark:text-white lg:text-5xl">
              De la planilla a la cancha en{" "}
              <GradientText>tres pasos</GradientText>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              No hay curva de aprendizaje ni configuración inicial: el primer
              torneo se arma en una tarde.
            </p>
          </div>
        </FadeInSection>

        <StaggerContainer className="grid gap-8 md:grid-cols-3">
          {PASOS.map((paso, i) => {
            const Icon = paso.icon;
            const numero = String(i + 1).padStart(2, "0");

            return (
              <StaggerItem key={paso.titulo}>
                <div className="group relative h-full rounded-3xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand/5 dark:border-gray-700 dark:bg-gray-800">
                  {/* El número es información, no adorno: marca el orden de la
                      secuencia. Por eso va visible y no como decoración suelta. */}
                  <span
                    className="absolute right-6 top-6 font-mono text-4xl font-bold text-gray-100 dark:text-gray-700"
                    aria-hidden="true"
                  >
                    {numero}
                  </span>

                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-brand-2 shadow-lg shadow-brand/25">
                    <Icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>

                  <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">
                    <span className="sr-only">Paso {i + 1}: </span>
                    {paso.titulo}
                  </h3>
                  <p className="leading-relaxed text-gray-600 dark:text-gray-400">
                    {paso.texto}
                  </p>

                  {/* Conector entre pasos: solo entre tarjetas, no después de
                      la última, y solo cuando están en fila (md+). */}
                  {i < PASOS.length - 1 && (
                    <div
                      className="absolute -right-4 top-1/2 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-gray-100 bg-white text-brand shadow-sm md:flex dark:border-gray-700 dark:bg-gray-800"
                      aria-hidden="true"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  )}
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        <FadeInSection delay={0.2}>
          <div className="mt-16 text-center">
            <Link
              href="/crear-liga"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand to-brand-2 px-8 py-3 font-semibold text-white shadow-lg shadow-brand/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              <Trophy className="h-4 w-4" aria-hidden="true" />
              Empezá con tu primer torneo
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </FadeInSection>
      </div>
    </section>
  );
}
