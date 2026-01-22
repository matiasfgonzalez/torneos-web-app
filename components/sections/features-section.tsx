import { SectionBadge } from "@/components/ui-dev/section-badge";
import { GradientText } from "@/components/ui-dev/gradient-text";
import { features } from "@/lib/constants/features";
import { ArrowRight } from "lucide-react";

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="relative py-24 bg-white dark:bg-gray-900 overflow-hidden"
    >
      {/* Pattern decorativo de fondo */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ad45ff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header de la sección */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <SectionBadge className="mb-6">
            Características Principales
          </SectionBadge>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Todo lo que necesitas para <GradientText>dominar</GradientText> tus
            torneos
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
            Desde la organización inicial hasta la ceremonia de premiación,
            GOLAZO te acompaña con herramientas profesionales en cada paso.
          </p>
        </div>

        {/* Grid de features con diseño premium */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="group relative">
                {/* Card con efecto glassmorphism */}
                <div className="relative h-full p-8 rounded-3xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-800/50 border border-gray-100 dark:border-gray-700/50 shadow-sm hover:shadow-2xl hover:shadow-[#ad45ff]/10 transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                  {/* Decoración de fondo en hover */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#ad45ff]/10 to-[#a3b3ff]/10 rounded-full blur-3xl translate-x-16 -translate-y-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Icono premium */}
                  <div className="relative mb-6">
                    <div className="relative w-16 h-16 bg-gradient-to-br from-[#ad45ff] to-[#a3b3ff] rounded-2xl flex items-center justify-center shadow-lg shadow-[#ad45ff]/25 group-hover:shadow-xl group-hover:shadow-[#ad45ff]/30 transition-all duration-300 group-hover:scale-110">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    {/* Número de feature */}
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center text-xs font-bold text-[#ad45ff] shadow-md border border-gray-100 dark:border-gray-600">
                      {(index + 1).toString().padStart(2, "0")}
                    </div>
                  </div>

                  {/* Contenido */}
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-[#ad45ff] dark:group-hover:text-[#a3b3ff] transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                    {feature.description}
                  </p>

                  {/* Link sutil */}
                  <div className="flex items-center text-sm font-medium text-[#ad45ff] opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    Saber más
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>

                  {/* Línea decorativa inferior */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
