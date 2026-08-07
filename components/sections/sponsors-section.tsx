"use client";

import { SPONSORS, featuredSponsor } from "@/lib/constants/sponsors";
import { GradientText } from "@/components/ui-dev/gradient-text";
import { FadeInSection } from "@/components/ui-dev/scroll-animations";
import { ArrowRight, Handshake } from "lucide-react";

export function SponsorsSection() {
  return (
    <section className="relative py-24 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      {/* Patrón de fondo sutil */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, var(--brand) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <FadeInSection>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand mb-4">
              Patrocinio
            </p>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Espacio para <GradientText>tus sponsors</GradientText>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Cada liga muestra a sus propios patrocinadores en su página pública. Estos
              son ejemplos de cómo se ven.
            </p>
          </div>
        </FadeInSection>

        {/* Marquee de patrocinadores */}
        <div 
          className="relative mb-20 overflow-hidden"
          style={{
            maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
            WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
          }}
        >
          {/* `.animate-marquee` de globals.css: los keyframes que había acá
              inline eran una copia exacta de los que ya existían allá, y un
              `<style>` en el árbol es global — dos definiciones del mismo
              nombre compitiendo por quién se declara último. */}
          <div className="flex w-max gap-6 animate-marquee">
            {[...SPONSORS, ...SPONSORS].map((sponsor, idx) => (
              <div
                key={`${sponsor.id}-${idx}`}
                className="group relative w-48 flex-shrink-0"
                // La segunda vuelta es un duplicado visual para que el bucle no
                // corte: para un lector de pantalla sería leer la lista dos veces.
                aria-hidden={idx >= SPONSORS.length}
              >
                <div className="relative flex items-center justify-center h-28 p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-brand/30 dark:hover:border-brand/30 transition-all duration-300 hover:shadow-xl hover:shadow-brand/5 hover:-translate-y-1">
                  <span
                    className={`text-lg font-extrabold tracking-tight bg-gradient-to-r ${sponsor.color} bg-clip-text text-transparent grayscale group-hover:grayscale-0 opacity-60 group-hover:opacity-100 transition-all duration-300 text-center`}
                  >
                    {sponsor.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Patrocinador destacado con diseño premium */}
        <FadeInSection>
          <div className="relative mb-20">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-brand/20 to-brand-2/20 rounded-3xl blur-2xl transform scale-95" />

            <div className="relative bg-gradient-to-br from-brand via-[#9a4dff] to-brand-2 rounded-3xl p-12 text-white overflow-hidden">
              {/* Patrón decorativo */}
              <div className="absolute inset-0 opacity-10">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  }}
                />
              </div>

              <div className="relative flex flex-col lg:flex-row items-center gap-12">
                {/* Monograma del sponsor (F1: sin imagen externa) */}
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 bg-white/10 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-4">
                    <span
                      aria-hidden="true"
                      className="text-4xl font-extrabold text-white"
                    >
                      {featuredSponsor.initials}
                    </span>
                    <span className="text-xs font-semibold text-white uppercase tracking-widest mt-1">
                      {featuredSponsor.name}
                    </span>
                  </div>
                </div>

                {/* Contenido */}
                <div className="flex-1 text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1 text-sm font-medium mb-4">
                    <span className="w-2 h-2 bg-white rounded-full motion-safe:animate-pulse"></span>
                    Ejemplo de patrocinador principal
                  </div>
                  {/* Acá había una cita firmada por "María González, Directora
                      de Marketing Deportivo": una clienta que no existe. Se
                      reemplaza por lo que el bloque realmente es — la maqueta
                      del espacio destacado que cada liga le vende a su sponsor. */}
                  <p className="text-2xl font-medium mb-6 leading-relaxed">
                    Así se ve el espacio destacado en la página de tu liga:
                    logo grande, mensaje propio y presencia en cada torneo que
                    publiques.
                  </p>
                  <p className="text-white/90 font-medium">
                    El patrocinio lo cobra la liga. GOLAZO no toma comisión.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </FadeInSection>

        {/* Become a Sponsor CTA */}
        <FadeInSection>
          <div className="relative">
            <div className="relative bg-white dark:bg-gray-800 rounded-3xl border-2 border-dashed border-brand/30 p-12 text-center">
              {/* Icono decorativo */}
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-brand/10 to-brand-2/10 rounded-2xl mb-6">
                <Handshake className="w-8 h-8 text-brand" />
              </div>

              <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                ¿Quieres ser nuestro próximo partner?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8 text-lg">
                Escribinos y armamos el espacio de tu marca dentro de las ligas que ya
                publican en GOLAZO.
              </p>
              {/* Eran dos <button> sin onClick ni destino: no hacían nada.
                  Queda uno solo, que baja al formulario de contacto real. */}
              <div className="flex justify-center">
                <a
                  href="#contacto"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-brand to-brand-2 px-6 py-3 text-lg font-semibold text-white shadow-lg shadow-brand/25 transition-colors hover:from-brand-hover hover:to-brand-2-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                >
                  Quiero patrocinar
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </FadeInSection>
      </div>
    </section>
  );
}
