import { GradientButton } from "@/components/ui-dev/gradient-button";
import { GradientText } from "@/components/ui-dev/gradient-text";
import { Check, Sparkles, Shield, Clock, Users } from "lucide-react";

export function PricingSection() {
  const features = [
    "Torneos ilimitados",
    "Equipos ilimitados",
    "Gestión completa de jugadores",
    "Tablas de posiciones en tiempo real",
    "Sistema de noticias integrado",
    "Publicidad y patrocinios",
    "Videos de YouTube integrados",
    "Estadísticas avanzadas",
    "Soporte prioritario 24/7",
    "Actualizaciones automáticas",
  ];

  const trustBadges = [
    { icon: Shield, text: "Pago seguro" },
    { icon: Clock, text: "Prueba 14 días gratis" },
    { icon: Users, text: "+10,000 usuarios" },
  ];

  return (
    <section
      id="precios"
      className="relative py-24 bg-white dark:bg-gray-900 overflow-hidden"
    >
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-[#ad45ff]/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-[#a3b3ff]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#ad45ff] mb-4">
            Precio simple y transparente
          </p>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Una inversión que <GradientText>vale la pena</GradientText>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Todo lo que necesitas para gestionar torneos profesionales, sin
            sorpresas ni costos ocultos
          </p>
        </div>

        <div className="flex justify-center">
          <div className="relative max-w-lg w-full">
            {/* Glow effect detrás de la card */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#ad45ff]/20 to-[#a3b3ff]/20 rounded-[2rem] blur-2xl transform scale-95" />

            {/* Card de pricing premium */}
            <div className="relative bg-white dark:bg-gray-800 rounded-[2rem] shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              {/* Badge superior */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-px">
                <div className="bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] text-white px-8 py-2 rounded-b-2xl text-sm font-semibold flex items-center gap-2 shadow-lg shadow-[#ad45ff]/25">
                  <Sparkles className="w-4 h-4" />
                  Plan Profesional
                </div>
              </div>

              <div className="p-10 pt-16">
                {/* Precio con estilo premium */}
                <div className="text-center mb-10">
                  <div className="flex items-baseline justify-center gap-2 mb-4">
                    <span className="text-2xl font-medium text-gray-500 dark:text-gray-400">
                      $
                    </span>
                    <span className="text-7xl font-bold bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] bg-clip-text text-transparent">
                      99
                    </span>
                    <span className="text-xl text-gray-500 dark:text-gray-400">
                      /mes
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Facturación mensual • Cancela cuando quieras
                  </p>
                </div>

                {/* Lista de features */}
                <ul className="space-y-4 mb-10">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-[#ad45ff]/10 to-[#a3b3ff]/10 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-[#ad45ff]" />
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <GradientButton className="w-full py-4 text-lg shadow-xl shadow-[#ad45ff]/25 hover:shadow-2xl hover:shadow-[#ad45ff]/30 transition-all duration-300">
                  Comenzar ahora
                </GradientButton>

                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                  Sin tarjeta de crédito requerida para la prueba
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-8 mt-16">
          {trustBadges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <div
                key={index}
                className="flex items-center gap-3 text-gray-600 dark:text-gray-400"
              >
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[#ad45ff]" />
                </div>
                <span className="font-medium">{badge.text}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
