import { getTorneos } from "@modules/torneos/actions/getTorneos";
import FiltroTorneos from "@modules/torneos/components/FiltroTorneos";
import { Badge } from "@/components/ui/badge";
import { TOURNAMENT_CATEGORY_LABELS } from "@/lib/constants";
import { TournamentCategory } from "@prisma/client";
import {
  Trophy,
  Users,
  Calendar,
  TrendingUp,
  Zap,
  Target,
  Award,
} from "lucide-react";

export default async function TorneosPage() {
  const torneos = await getTorneos();

  // Calcular estadísticas
  const torneosActivos = torneos.filter(
    (t) => t.status === "ACTIVO" || t.status === "INSCRIPCION",
  ).length;
  const totalEquipos = torneos.reduce(
    (acc, t) => acc + (t.tournamentTeams?.length || 0),
    0,
  );
  const proximosPartidos = torneos.filter((t) => t.nextMatch).length;

  return (
    <div className="min-h-screen premium-gradient-bg">
      {/* Hero Section - Premium Golazo Style */}
      <section className="relative overflow-hidden py-20 lg:py-28">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-[#ad45ff]/20 to-[#a3b3ff]/20 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-[#a3b3ff]/15 to-[#ad45ff]/15 rounded-full blur-3xl transform -translate-x-1/4 translate-y-1/4" />
          {/* Geometric accents */}
          <div className="absolute top-20 right-20 w-32 h-0.5 bg-gradient-to-r from-[#ad45ff] to-transparent opacity-40" />
          <div className="absolute top-28 right-28 w-20 h-0.5 bg-gradient-to-r from-[#a3b3ff] to-transparent opacity-30" />
          <div className="absolute bottom-32 left-16 w-40 h-0.5 bg-gradient-to-l from-[#ad45ff] to-transparent opacity-30" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            {/* Badge animado */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] text-white px-5 py-2 rounded-full shadow-lg shadow-[#ad45ff]/25 animate-pulse">
              <Trophy className="w-5 h-5" />
              <span className="font-semibold">Competiciones Oficiales</span>
              <Zap className="w-4 h-4" />
            </div>

            {/* Título principal */}
            <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 dark:text-white text-balance leading-tight">
              Descubre Todos los{" "}
              <span className="relative">
                <span className="bg-gradient-to-r from-[#ad45ff] via-[#c77dff] to-[#a3b3ff] bg-clip-text text-transparent">
                  Torneos
                </span>
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  height="8"
                  viewBox="0 0 200 8"
                  fill="none"
                >
                  <path
                    d="M1 5.5C47.6667 2.16667 141.4 -2.3 199 5.5"
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
              </span>
            </h1>

            {/* Descripción */}
            <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-pretty leading-relaxed">
              Desde ligas locales hasta campeonatos regionales. Encuentra tu
              próximo desafío deportivo y lleva a tu equipo a la gloria.
            </p>
          </div>

          {/* Stats Cards - Premium Glassmorphism */}
          <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <div className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-[#ad45ff]/5 to-[#a3b3ff]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-[#ad45ff] to-[#a3b3ff] rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-[#ad45ff]/20">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                  {torneos.length}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  Torneos Totales
                </div>
              </div>
            </div>

            <div className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-green-500/20">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                  {torneosActivos}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  En Competencia
                </div>
              </div>
            </div>

            <div className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                  {totalEquipos}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  Equipos Participantes
                </div>
              </div>
            </div>

            <div className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-orange-500/20">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                  {proximosPartidos}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  Con Próximos Partidos
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Categories - Premium Pills */}
      <section className="py-8 border-y border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 mr-2">
              Categorías populares:
            </span>
            {(
              [
                "LIBRE",
                "VETERANO",
                "PRIMERA",
                "RESERVA",
                "FEMENINO",
              ] as TournamentCategory[]
            ).map((cat) => (
              <Badge
                key={cat}
                variant="outline"
                className="px-4 py-2 text-sm font-medium border-2 border-[#ad45ff]/30 text-[#ad45ff] hover:bg-[#ad45ff] hover:text-white transition-all cursor-pointer"
              >
                {TOURNAMENT_CATEGORY_LABELS[cat]}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content - Filter & Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FiltroTorneos tournaments={torneos} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full mb-6">
            <Award className="w-5 h-5" />
            <span className="font-medium">¿Eres organizador?</span>
          </div>

          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6 text-balance">
            Crea tu Propio Torneo Profesional
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto text-pretty">
            Únete a GOLAZO y gestiona torneos con todas las herramientas que
            necesitas: fixture automático, estadísticas en vivo y más.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="inline-flex items-center justify-center gap-2 bg-white text-[#ad45ff] font-semibold px-8 py-4 rounded-xl hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5">
              <Trophy className="w-5 h-5" />
              Crear Torneo Gratis
            </button>
            <button className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-white text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition-all">
              <TrendingUp className="w-5 h-5" />
              Ver Demo
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
