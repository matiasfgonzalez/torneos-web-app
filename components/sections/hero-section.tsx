import { Badge } from "@/components/ui/badge";
import { GradientButton } from "@/components/ui-dev/gradient-button";
import { GradientText } from "@/components/ui-dev/gradient-text";
import { Play, ArrowRight, Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-8 pb-20 lg:pt-16 lg:pb-32">
      {/* Background con gradiente sutil y patrón */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#ad45ff]/5 via-transparent to-[#a3b3ff]/5 dark:from-[#ad45ff]/10 dark:via-transparent dark:to-[#a3b3ff]/10" />

      {/* Elementos decorativos premium */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#ad45ff]/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#a3b3ff]/10 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-[#ad45ff]/5 to-transparent rounded-full" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-10">
            {/* Badge premium con efecto glow */}
            <div className="inline-flex">
              <Badge className="bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] text-white border-0 px-4 py-2 text-sm font-medium shadow-lg shadow-[#ad45ff]/25 hover:shadow-[#ad45ff]/40 transition-shadow duration-300">
                <Sparkles className="w-4 h-4 mr-2" />
                Plataforma #1 en Gestión de Torneos
              </Badge>
            </div>

            {/* Título con mejor jerarquía */}
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 dark:text-white leading-[1.1] tracking-tight">
                Gestiona Torneos{" "}
                <span className="block mt-2">
                  Como un{" "}
                  <GradientText className="relative">
                    Profesional
                    <svg
                      className="absolute -bottom-2 left-0 w-full"
                      height="8"
                      viewBox="0 0 200 8"
                      fill="none"
                    >
                      <path
                        d="M1 5.5C47.6667 2.16667 141 -2.4 199 5.5"
                        stroke="url(#underline-gradient)"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient
                          id="underline-gradient"
                          x1="0"
                          y1="0"
                          x2="200"
                          y2="0"
                        >
                          <stop stopColor="#ad45ff" />
                          <stop offset="1" stopColor="#a3b3ff" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </GradientText>
                </span>
              </h1>
              <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-xl">
                La plataforma integral para organizar torneos con{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  tablas en tiempo real
                </span>
                , gestión de equipos y contenido multimedia.
              </p>
            </div>

            {/* CTAs con mejor diseño */}
            <div className="flex flex-col sm:flex-row gap-4">
              <GradientButton
                size="lg"
                className="text-lg px-8 py-4 shadow-xl shadow-[#ad45ff]/25 hover:shadow-2xl hover:shadow-[#ad45ff]/30 transition-all duration-300 hover:-translate-y-0.5"
              >
                <Play className="w-5 h-5 mr-2" />
                Ver Demo en Vivo
              </GradientButton>
              <GradientButton
                size="lg"
                variant="outline"
                className="text-lg px-8 py-4 hover:-translate-y-0.5 transition-all duration-300"
              >
                Registrarse Gratis
                <ArrowRight className="w-5 h-5 ml-2" />
              </GradientButton>
            </div>

            {/* Stats con diseño premium - responsive grid */}
            <div className="grid grid-cols-3 gap-4 sm:gap-6 lg:gap-8 pt-6">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-[#ad45ff]/20 to-[#a3b3ff]/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative text-center px-2 sm:px-4 py-3">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] bg-clip-text text-transparent">
                    10K+
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
                    Torneos Activos
                  </div>
                </div>
              </div>
              <div className="relative group border-x border-gray-200 dark:border-gray-700">
                <div className="absolute inset-0 bg-gradient-to-r from-[#ad45ff]/20 to-[#a3b3ff]/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative text-center px-2 sm:px-4 py-3">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] bg-clip-text text-transparent">
                    50K+
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
                    Equipos Registrados
                  </div>
                </div>
              </div>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-[#ad45ff]/20 to-[#a3b3ff]/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative text-center px-2 sm:px-4 py-3">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] bg-clip-text text-transparent">
                    99.9%
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
                    Uptime Garantizado
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="relative lg:pl-8">
            {/* Card flotante premium */}
            <div className="relative">
              {/* Glow effect detrás de la card */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#ad45ff]/30 to-[#a3b3ff]/30 rounded-3xl blur-2xl transform scale-95" />

              <div className="relative bg-white dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-100 dark:border-gray-700/50">
                {/* Header de la card */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] rounded-xl flex items-center justify-center">
                      <span className="text-white text-lg">🏆</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        Copa de Verano 2026
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        5ª Edición
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 px-3 py-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                    En Vivo
                  </Badge>
                </div>

                {/* Tabla de posiciones */}
                <div className="space-y-3">
                  {/* Equipo 1 - Líder */}
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#ad45ff]/10 to-[#a3b3ff]/10 dark:from-[#ad45ff]/20 dark:to-[#a3b3ff]/20 rounded-2xl border border-[#ad45ff]/20 dark:border-[#ad45ff]/30">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-[#ad45ff]/30">
                        1
                      </div>
                      <img
                        src="https://federacionentrerrianadefutbol.org.ar/wp-content/uploads/2022/07/Club-Social-y-Deportivo-Talleres.png"
                        alt="Escudo de Talleres"
                        width={44}
                        height={44}
                        className="object-cover rounded-xl shadow-md"
                      />
                      <span className="font-semibold text-gray-900 dark:text-white">
                        CSD Talleres
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] bg-clip-text text-transparent">
                        45
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        puntos
                      </div>
                    </div>
                  </div>

                  {/* Equipo 2 */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold text-sm">
                        2
                      </div>
                      <img
                        src="https://federacionentrerrianadefutbol.org.ar/wp-content/uploads/2022/07/Club-Social-y-Deportivo-Ateneo.png"
                        alt="Escudo de Ateneo"
                        width={44}
                        height={44}
                        className="object-cover rounded-xl shadow-md"
                      />
                      <span className="font-medium text-gray-900 dark:text-white">
                        CSD Ateneo
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-700 dark:text-gray-200">
                        42
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        puntos
                      </div>
                    </div>
                  </div>

                  {/* Equipo 3 */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold text-sm">
                        3
                      </div>
                      <img
                        src="https://federacionentrerrianadefutbol.org.ar/wp-content/uploads/2022/07/Club-Atletico-Nueva-Vizcaya.png"
                        alt="Escudo de Vizcaya"
                        width={44}
                        height={44}
                        className="object-cover rounded-xl shadow-md"
                      />
                      <span className="font-medium text-gray-900 dark:text-white">
                        CA Vizcaya
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-700 dark:text-gray-200">
                        38
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        puntos
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer de la card */}
                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Actualizado en tiempo real
                  </span>
                  <div className="flex items-center gap-1 text-sm font-medium text-[#ad45ff]">
                    Ver torneo completo
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Elementos decorativos flotantes */}
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] rounded-2xl opacity-20 rotate-12" />
            <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-gradient-to-r from-[#a3b3ff] to-[#ad45ff] rounded-full opacity-20" />
          </div>
        </div>
      </div>
    </section>
  );
}
