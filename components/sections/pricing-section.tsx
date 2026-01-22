import { SectionBadge } from "@/components/ui-dev/section-badge";
import { GradientButton } from "@/components/ui-dev/gradient-button";

const CheckIcon = () => (
  <svg
    className="h-5 w-5 text-green-500 mr-3 flex-shrink-0"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

export function PricingSection() {
  const features = [
    "Equipos ilimitados",
    "Torneos ilimitados",
    "Gestión completa de jugadores",
    "Tablas de posiciones en tiempo real",
    "Sistema de noticias integrado",
    "Publicidad y patrocinios",
    "Videos de YouTube integrados",
    "Estadísticas avanzadas",
    "Soporte 24/7",
    "Actualizaciones automáticas",
  ];

  return (
    <section
      id="precios"
      className="py-20 bg-gradient-to-r from-[#ad45ff]/5 to-[#a3b3ff]/5 dark:from-[#ad45ff]/10 dark:to-[#a3b3ff]/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <SectionBadge>Plan y Precio</SectionBadge>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Una Solución Completa
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Todo lo que necesitas para gestionar torneos profesionales en un
            solo plan
          </p>
        </div>

        <div className="flex justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 max-w-md w-full relative overflow-hidden">
            {/* Badge destacado */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] text-white px-6 py-2 rounded-full text-sm font-semibold">
                Plan Completo
              </div>
            </div>

            <div className="text-center mb-8 mt-4">
              <div className="flex items-center justify-center mb-4">
                <span className="text-5xl font-bold text-gray-900 dark:text-white">
                  $99
                </span>
                <span className="text-gray-600 dark:text-gray-300 ml-2">
                  /mes
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Acceso completo a todas las funcionalidades
              </p>
            </div>

            <ul className="space-y-4 mb-8">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <CheckIcon />
                  <span className="text-gray-700 dark:text-gray-300">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <GradientButton className="w-full" size="lg">
              Registrarse
            </GradientButton>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
              Sin restricciones • Soporte incluido • Actualizaciones gratuitas
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

