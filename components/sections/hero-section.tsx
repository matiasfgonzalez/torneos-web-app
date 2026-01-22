import { Badge } from "@/components/ui/badge";
import { GradientButton } from "@/components/ui-dev/gradient-button";
import { GradientText } from "@/components/ui-dev/gradient-text";
import { Play, ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      <div className="absolute inset-0 bg-gradient-to-r from-[#ad45ff]/5 to-[#a3b3ff]/5 dark:from-[#ad45ff]/10 dark:to-[#a3b3ff]/10"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge className="bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] text-white border-0">
                🏆 Plataforma #1 en Gestión de Torneos
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white text-balance">
                Gestiona Torneos Como un{" "}
                <GradientText>Profesional</GradientText>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 text-pretty leading-relaxed">
                GOLAZO te permite organizar torneos completos con tablas de
                posiciones en tiempo real, gestión de equipos y jugadores,
                noticias deportivas y contenido multimedia integrado.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <GradientButton size="lg" className="text-lg px-8">
                <Play className="w-5 h-5 mr-2" />
                Ver Demo en Vivo
              </GradientButton>
              <GradientButton
                size="lg"
                variant="outline"
                className="text-lg px-8"
              >
                Registrarse
                <ArrowRight className="w-5 h-5 ml-2" />
              </GradientButton>
            </div>
            <div className="flex items-center space-x-8 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  10K+
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Torneos Activos
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  50K+
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Equipos Registrados
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  99.9%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Tiempo Activo
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Liga Profesional 2024
                  </h3>
                  <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                    En Vivo
                  </Badge>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-[#ad45ff]/10 to-[#a3b3ff]/10 dark:from-[#ad45ff]/20 dark:to-[#a3b3ff]/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <img
                        src={
                          "https://federacionentrerrianadefutbol.org.ar/wp-content/uploads/2022/07/Club-Social-y-Deportivo-Talleres.png"
                        }
                        alt={`Escudo de Talleres`}
                        width={42}
                        height={42}
                        className="object-cover border-border group-hover:border-primary/50 transition-colors rounded"
                      />
                      <span className="font-medium text-gray-900 dark:text-white">
                        Club Social y Deportivo Talleres
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900 dark:text-white">
                        45 pts
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        1° lugar
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <img
                        src={
                          "https://federacionentrerrianadefutbol.org.ar/wp-content/uploads/2022/07/Club-Social-y-Deportivo-Ateneo.png"
                        }
                        alt={`Escudo de Ateneo`}
                        width={42}
                        height={42}
                        className="object-cover border-border group-hover:border-primary/50 transition-colors rounded"
                      />
                      <span className="font-medium text-gray-900 dark:text-white">
                        Club Social y Deportivo Ateneo
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900 dark:text-white">
                        42 pts
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        2° lugar
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <img
                        src={
                          "https://federacionentrerrianadefutbol.org.ar/wp-content/uploads/2022/07/Club-Atletico-Nueva-Vizcaya.png"
                        }
                        alt={`Escudo de Vizcaya`}
                        width={42}
                        height={42}
                        className="object-cover border-border group-hover:border-primary/50 transition-colors rounded"
                      />
                      <span className="font-medium text-gray-900 dark:text-white">
                        Club Social y Deportivo Vizcaya
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900 dark:text-white">
                        38 pts
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        3° lugar
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-r from-[#a3b3ff] to-[#ad45ff] rounded-full opacity-20 animate-pulse delay-1000"></div>
          </div>
        </div>
      </div>
    </section>
  );
}

