import { getEquipos } from "@modules/equipos/actions/getEquipos";
import TeamsList from "@modules/equipos/components/public/TeamsList";
import { Badge } from "@/components/ui/badge";
import { PageHero, HeroHighlight } from "@/components/shared/PageHero";
import Link from "next/link";
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
      {/* Hero - componente compartido F0 (patrón §1 de UI_PATTERNS) */}
      <PageHero
        badge={{ icon: Shield, text: "Equipos Oficiales", endIcon: Zap }}
        title={
          <>
            Conoce a los <HeroHighlight>Equipos</HeroHighlight>
          </>
        }
        subtitle="Explora todos los equipos que participan en nuestros torneos. Conoce sus planteles, historia y trayectoria deportiva."
        stats={[
          { icon: Shield, value: totalEquipos, label: "Equipos Activos" },
          {
            icon: MapPin,
            value: ciudadesUnicas,
            label: "Ciudades",
            gradient: "from-blue-500 to-cyan-500",
            shadow: "shadow-blue-500/20",
          },
          {
            icon: Users,
            value: conEntrenador,
            label: "Con Entrenador",
            gradient: "from-green-500 to-emerald-500",
            shadow: "shadow-green-500/20",
          },
          {
            icon: Star,
            value: conLogo,
            label: "Con Escudo",
            gradient: "from-orange-500 to-amber-500",
            shadow: "shadow-orange-500/20",
          },
        ]}
      />

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
                  className="px-4 py-2 text-sm font-medium border-2 border-brand/30 text-brand hover:bg-brand hover:text-white transition-all cursor-pointer"
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
        <div className="absolute inset-0 bg-gradient-to-r from-brand to-brand-2 opacity-95" />
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
            {/* antes apuntaba a /login, ruta inexistente (404) */}
            <Link
              href="/crear-liga"
              className="inline-flex items-center justify-center gap-2 bg-white text-brand px-8 py-4 rounded-xl font-bold shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300"
            >
              <TrendingUp className="w-5 h-5" />
              Registrar Equipo
            </Link>
            <Link
              href="/torneos"
              className="inline-flex items-center justify-center gap-2 bg-white/20 backdrop-blur-xl text-white px-8 py-4 rounded-xl font-bold border border-white/30 hover:bg-white/30 transition-all duration-300"
            >
              Ver Torneos Disponibles
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
