import { ITorneo } from "@modules/torneos/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDate } from "@/lib/formatDate";
import { Users, Trophy, Target, Clock, Building, Calendar } from "lucide-react";
import { TOURNAMENT_FORMAT_LABELS } from "@/lib/constants";
import { TournamentFormat } from "@prisma/client";

interface PropsQuickStats {
  readonly tournamentData: ITorneo;
}

const QuickStats = ({ tournamentData }: PropsQuickStats) => {
  const getFormatLabel = (format: string) => {
    return TOURNAMENT_FORMAT_LABELS[format as TournamentFormat] || format;
  };

  const stats = [
    {
      title: "Equipos",
      value: tournamentData.tournamentTeams?.length || 0,
      icon: Users,
      color: "from-blue-500 to-cyan-500",
      iconBg: "bg-gradient-to-br from-blue-500 to-cyan-500",
      description: "registrados",
    },
    {
      title: "Partidos",
      value: tournamentData.matches?.length || 0,
      icon: Target,
      color: "from-green-500 to-emerald-500",
      iconBg: "bg-gradient-to-br from-green-500 to-emerald-500",
      description: "programados",
    },
    {
      title: "Formato",
      value: getFormatLabel(tournamentData.format || "LIGA"),
      icon: Trophy,
      color: "from-[#ad45ff] to-[#c77dff]",
      iconBg: "bg-gradient-to-br from-[#ad45ff] to-[#c77dff]",
      description: "de competencia",
      isText: true,
    },
    {
      title: "Modalidad",
      value: tournamentData.homeAndAway ? "Ida y Vuelta" : "Solo Ida",
      icon: Calendar,
      color: "from-purple-500 to-pink-500",
      iconBg: "bg-gradient-to-br from-purple-500 to-pink-500",
      description: "de juego",
      isText: true,
    },
    {
      title: "Liga",
      value: tournamentData.liga || "Sin asignar",
      icon: Building,
      color: "from-orange-500 to-red-500",
      iconBg: "bg-gradient-to-br from-orange-500 to-red-500",
      description: "organizador",
      isText: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-[#ad45ff] to-[#c77dff] rounded-xl shadow-lg shadow-[#ad45ff]/25">
          <Trophy className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Estadísticas del Torneo
        </h2>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:gap-5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <Card
              key={stat.title}
              className="group relative overflow-hidden border border-gray-100 dark:border-gray-800 hover:border-[#ad45ff]/30 transition-all duration-300 hover:shadow-xl hover:shadow-[#ad45ff]/10 hover:-translate-y-1 bg-white dark:bg-gray-900 rounded-2xl"
            >
              {/* Gradient accent bar */}
              <div className={`h-1 bg-gradient-to-r ${stat.color}`} />

              {/* Hover gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#ad45ff]/0 to-[#c77dff]/0 group-hover:from-[#ad45ff]/5 group-hover:to-[#c77dff]/5 transition-all duration-300 pointer-events-none" />

              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-4">
                <div
                  className={`p-2.5 rounded-xl ${stat.iconBg} shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  <IconComponent className="w-5 h-5 text-white" />
                </div>
              </CardHeader>

              <CardContent className="relative px-4 pb-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {stat.title}
                  </p>
                  <div
                    className={`${stat.isText ? "text-lg" : "text-3xl"} font-black text-gray-900 dark:text-white ${stat.isText && String(stat.value).length > 12 ? "text-sm" : ""}`}
                  >
                    {stat.value}
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {stat.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Próximo partido destacado */}
      {tournamentData.nextMatch && (
        <Card className="relative overflow-hidden border border-amber-200 dark:border-amber-700/30 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl">
          <div className="h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400" />
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl shadow-lg shadow-amber-500/25">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                  Próximo Partido
                </h3>
                <p className="text-amber-700 dark:text-amber-300 font-medium">
                  {formatDate(
                    tournamentData.nextMatch,
                    "EEEE dd 'de' MMMM 'a las' HH:mm",
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuickStats;
