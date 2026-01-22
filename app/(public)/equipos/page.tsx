import { getEquipos } from "@modules/equipos/actions/getEquipos";
import TeamsList from "@modules/equipos/components/public/TeamsList";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  MapPin,
  Zap,
  Shield,
  Star,
  Award,
  TrendingUp,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PublicTeamsPage() {
  const allTeams = await getEquipos();
  // Filter only enabled teams for public view
  const activeTeams = allTeams.filter((team) => team.enabled);

  // Calcular estadísticas
  const totalEquipos = activeTeams.length;
  const ciudadesUnicas = new Set(
    activeTeams.map((t) => t.homeCity).filter(Boolean),
  ).size;
  const conEntrenador = activeTeams.filter((t) => t.coach).length;
  const conLogo = activeTeams.filter((t) => t.logoUrl).length;

  // Obtener ciudades más populares
  const ciudadesPopulares = Object.entries(
    activeTeams.reduce(
      (acc, team) => {
        if (team.homeCity) {
          acc[team.homeCity] = (acc[team.homeCity] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>,
    ),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

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
              <Shield className="w-5 h-5" />
              <span className="font-semibold">Equipos Oficiales</span>
              <Zap className="w-4 h-4" />
            </div>

            {/* Título principal */}
            <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 dark:text-white text-balance leading-tight">
              Conoce a los{" "}
              <span className="relative">
                <span className="bg-gradient-to-r from-[#ad45ff] via-[#c77dff] to-[#a3b3ff] bg-clip-text text-transparent">
                  Equipos
                </span>
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  height="8"
                  viewBox="0 0 200 8"
                  fill="none"
                >
                  <path
                    d="M1 5.5C47.6667 2.16667 141.4 -2.3 199 5.5"
                    stroke="url(#underline-gradient-equipos)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient
                      id="underline-gradient-equipos"
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
              Explora todos los equipos que participan en nuestros torneos.
              Conoce sus planteles, historia y trayectoria deportiva.
            </p>
          </div>

          {/* Stats Cards - Premium Glassmorphism */}
          <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <div className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-[#ad45ff]/5 to-[#a3b3ff]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-[#ad45ff] to-[#a3b3ff] rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-[#ad45ff]/20">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                  {totalEquipos}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  Equipos Activos
                </div>
              </div>
            </div>

            <div className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                  {ciudadesUnicas}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  Ciudades
                </div>
              </div>
            </div>

            <div className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-green-500/20">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                  {conEntrenador}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  Con Entrenador
                </div>
              </div>
            </div>

            <div className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-orange-500/20">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                  {conLogo}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  Con Escudo
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Cities - Premium Pills */}
      {ciudadesPopulares.length > 0 && (
        <section className="py-8 border-y border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 mr-2">
                Ciudades destacadas:
              </span>
              {ciudadesPopulares.map(([ciudad, count]) => (
                <Badge
                  key={ciudad}
                  variant="outline"
                  className="px-4 py-2 text-sm font-medium border-2 border-[#ad45ff]/30 text-[#ad45ff] hover:bg-[#ad45ff] hover:text-white transition-all cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 mr-1.5" />
                  {ciudad} ({count})
                </Badge>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Content - Teams List */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <TeamsList initialTeams={activeTeams} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] opacity-95" />
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute bottom-10 right-10 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl mb-6 shadow-xl">
            <Award className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            ¿Quieres registrar tu equipo?
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Únete a nuestra comunidad deportiva y participa en los mejores
            torneos de la región.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/login"
              className="inline-flex items-center justify-center gap-2 bg-white text-[#ad45ff] px-8 py-4 rounded-xl font-bold shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300"
            >
              <TrendingUp className="w-5 h-5" />
              Registrar Equipo
            </a>
            <a
              href="/torneos"
              className="inline-flex items-center justify-center gap-2 bg-white/20 backdrop-blur-xl text-white px-8 py-4 rounded-xl font-bold border border-white/30 hover:bg-white/30 transition-all duration-300"
            >
              Ver Torneos Disponibles
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
