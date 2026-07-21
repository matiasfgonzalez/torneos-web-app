import { getTorneos } from "@modules/torneos/actions/getTorneos";
import FiltroTorneos from "@modules/torneos/components/FiltroTorneos";
import { Badge } from "@/components/ui/badge";
import { PageHero, HeroHighlight } from "@/components/shared/PageHero";
import { AGE_GROUP_LABELS } from "@/lib/constants";
import { AgeGroup } from "@prisma/client";
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
  // Contar partidos programados
  const proximosPartidos = torneos.reduce(
    (acc, t) => acc + (t.matches?.filter((m) => m.status === "PROGRAMADO")?.length || 0),
    0,
  );

  return (
    <div className="min-h-screen premium-gradient-bg">
      {/* Hero Section - componente compartido F0 (patrón §1 de UI_PATTERNS) */}
      <PageHero
        badge={{ icon: Trophy, text: "Competiciones Oficiales", endIcon: Zap }}
        title={
          <>
            Descubre Todos los <HeroHighlight>Torneos</HeroHighlight>
          </>
        }
        subtitle="Desde ligas locales hasta campeonatos regionales. Encuentra tu próximo desafío deportivo y lleva a tu equipo a la gloria."
        stats={[
          { icon: Trophy, value: torneos.length, label: "Torneos Totales" },
          {
            icon: Target,
            value: torneosActivos,
            label: "En Competencia",
            gradient: "from-green-500 to-emerald-500",
            shadow: "shadow-green-500/20",
          },
          {
            icon: Users,
            value: totalEquipos,
            label: "Equipos Participantes",
            gradient: "from-blue-500 to-cyan-500",
            shadow: "shadow-blue-500/20",
          },
          {
            icon: Calendar,
            value: proximosPartidos,
            label: "Con Próximos Partidos",
            gradient: "from-orange-500 to-amber-500",
            shadow: "shadow-orange-500/20",
          },
        ]}
      />

      {/* Quick Categories - Premium Pills */}
      <section className="py-8 border-y border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 mr-2">
              Categorías populares:
            </span>
            {(
              ["LIBRE", "VETERANO", "SENIOR", "JUVENIL", "SUB_17"] as AgeGroup[]
            ).map((cat) => (
              <Badge
                key={cat}
                variant="outline"
                className="px-4 py-2 text-sm font-medium border-2 border-brand/30 text-brand hover:bg-brand hover:text-white transition-all cursor-pointer"
              >
                {AGE_GROUP_LABELS[cat]}
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
      <section className="py-20 bg-gradient-to-r from-brand to-brand-2 relative overflow-hidden">
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
            <button className="inline-flex items-center justify-center gap-2 bg-white text-brand font-semibold px-8 py-4 rounded-xl hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5">
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
