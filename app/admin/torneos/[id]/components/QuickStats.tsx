import { ITorneo } from "@/components/torneos/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/formatDate";
import {
  Users,
  Trophy,
  Target,
  Clock,
  Building,
  Calendar,
  TrendingUp,
} from "lucide-react";

interface PropsQuickStats {
  tournamentData: ITorneo;
}

const QuickStats = (props: PropsQuickStats) => {
  const { tournamentData } = props;

  const stats = [
    {
      title: "Equipos Registrados",
      value: tournamentData.tournamentTeams?.length || 0,
      icon: Users,
      color: "from-blue-500 to-cyan-500",
      bgColor:
        "from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20",
      description: "equipos participantes",
    },
    {
      title: "Partidos",
      value: tournamentData.matches?.length || 0,
      icon: Target,
      color: "from-green-500 to-emerald-500",
      bgColor:
        "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
      description: "encuentros registrados",
    },
    {
      title: "Formato",
      value: tournamentData.format || "Liga",
      icon: Trophy,
      color: "from-[#ad45ff] to-[#a3b3ff]",
      bgColor:
        "from-[#ad45ff]/10 to-[#a3b3ff]/10 dark:from-[#ad45ff]/20 dark:to-[#a3b3ff]/20",
      description: "tipo de competencia",
      isText: true,
    },
    {
      title: "Ida y Vuelta",
      value: tournamentData.homeAndAway ? "Sí" : "No",
      icon: Calendar,
      color: "from-purple-500 to-pink-500",
      bgColor:
        "from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20",
      description: "modalidad de juego",
      isText: true,
    },
    {
      title: "Liga/Asociación",
      value: tournamentData.liga || "No especificado",
      icon: Building,
      color: "from-orange-500 to-red-500",
      bgColor:
        "from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20",
      description: "organizador",
      isText: true,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="w-1 h-6 bg-gradient-to-b from-[#ad45ff] to-[#a3b3ff] rounded-full" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Estadísticas del Torneo
        </h2>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <Card
              key={stat.title}
              className="group relative overflow-hidden border-2 border-gray-100 dark:border-gray-700 hover:border-[#ad45ff]/30 dark:hover:border-[#ad45ff]/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white dark:bg-gray-800"
            >
              {/* Background gradient sutil */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${stat.bgColor} opacity-50`}
              />

              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </CardTitle>
                  <div
                    className={`${
                      stat.isText ? "text-lg" : "text-2xl"
                    } font-bold text-gray-900 dark:text-white ${
                      stat.isText && stat.value.length > 10 ? "text-sm" : ""
                    }`}
                  >
                    {stat.value}
                  </div>
                </div>

                <div
                  className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
              </CardHeader>

              <CardContent className="relative pt-0">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
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
        <Card className="border-2 border-yellow-200 dark:border-yellow-600/30 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Próximo Partido
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {formatDate(
                    tournamentData.nextMatch,
                    "EEEE dd 'de' MMMM 'a las' HH:mm"
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
