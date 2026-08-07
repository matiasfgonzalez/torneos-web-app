"use client";

import { GradientText } from "@/components/ui-dev/gradient-text";
import { Trophy, Users, Zap, Shield } from "lucide-react";
import { FadeInSection, StaggerContainer, StaggerItem } from "@/components/ui-dev/scroll-animations";

const valueProps = [
  {
    icon: Trophy,
    title: "Torneos Profesionales",
    description:
      "Crea y gestiona competencias de cualquier tamaño con herramientas de nivel empresarial.",
  },
  {
    icon: Users,
    title: "Para Organizadores",
    description:
      "Diseñado para ligas, clubes, escuelas y organizadores que buscan excelencia.",
  },
  {
    icon: Zap,
    title: "Tiempo Real",
    description:
      "Actualización instantánea de resultados, tablas y estadísticas sin recargar.",
  },
  {
    icon: Shield,
    title: "Confiable y Seguro",
    description:
      "Infraestructura robusta con 99.9% de uptime y respaldo de datos.",
  },
];

export function ValuePropositionSection() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Separador superior decorativo */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />

      {/* Background pattern sutil */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand/5 via-transparent to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Encabezado centrado */}
        <FadeInSection>
          <div className="text-center max-w-3xl mx-auto mb-20">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand mb-4">
              ¿Por qué elegir GOLAZO?
            </p>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              La plataforma que <GradientText>transforma</GradientText> la gestión
              deportiva
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              Entiende qué hace diferente a GOLAZO en solo segundos. Sin
              complicaciones, sin curvas de aprendizaje.
            </p>
          </div>
        </FadeInSection>

        {/* Grid de propuestas de valor */}
        <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {valueProps.map((prop, index) => {
            const Icon = prop.icon;
            return (
              <StaggerItem key={index}>
                {/* `perspective-1000` no existe: ni en globals.css ni en
                    Tailwind v4 (sería `perspective-[1000px]`). Era una clase
                    huérfana, así que la perspectiva del tilt nunca se aplicó
                    desde el padre — la que funciona es la del `transform` de
                    abajo, que la trae incluida. Se saca la clase muerta y se
                    deja `transition-all` para que la sombra también anime. */}
                <div className="group relative h-full">
                  <div className="relative h-full p-8 rounded-2xl bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 hover:border-brand/30 dark:hover:border-brand/30 transition-all duration-500 hover:shadow-xl hover:shadow-brand/5 transform-gpu group-hover:[transform:perspective(1000px)_rotateX(5deg)_rotateY(-5deg)_scale(1.02)]">
                    {/* Línea decorativa superior */}
                    <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-brand/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Icono */}
                    <div className="relative mb-6">
                      <div className="w-14 h-14 bg-gradient-to-br from-brand/10 to-brand-2/10 dark:from-brand/20 dark:to-brand-2/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-7 h-7 text-brand" />
                      </div>
                      {/* Glow en hover */}
                      <div className="absolute inset-0 bg-brand/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
                    </div>

                    {/* Contenido */}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                      {prop.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {prop.description}
                    </p>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        {/* Línea visual de conexión entre secciones */}
        <FadeInSection>
          <div className="flex justify-center mt-20">
            <div className="flex flex-col items-center">
              <div className="w-px h-16 bg-gradient-to-b from-brand/50 to-transparent" />
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-brand to-brand-2" />
            </div>
          </div>
        </FadeInSection>
      </div>
    </section>
  );
}
