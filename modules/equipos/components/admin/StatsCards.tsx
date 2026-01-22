import { ITeam } from "@modules/equipos/types/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users, CheckCircle, XCircle, TrendingUp } from "lucide-react";

interface PropsStatsCards {
  teams: ITeam[];
}

const StatsCards = (props: PropsStatsCards) => {
  const { teams } = props;

  const stats = [
    {
      title: "Total Equipos",
      value: teams.length,
      icon: Trophy,
      color: "from-[#ad45ff] to-[#a3b3ff]",
      bgColor: "from-[#ad45ff]/10 to-[#a3b3ff]/10",
      description: "Equipos registrados",
    },
    {
      title: "Activos",
      value: teams.filter((t) => t.enabled === true).length,
      icon: CheckCircle,
      color: "from-green-500 to-emerald-500",
      bgColor:
        "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
      description: "En competencia",
    },
    {
      title: "Deshabilitados",
      value: teams.filter((t) => t.enabled === false).length,
      icon: XCircle,
      color: "from-red-500 to-rose-500",
      bgColor:
        "from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20",
      description: "No habilitados para seleccionar",
    },
    {
      title: "Total Jugadores",
      value: teams.reduce((acc, t) => acc + (t.players?.length || 0), 0),
      icon: Users,
      color: "from-blue-500 to-cyan-500",
      bgColor:
        "from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20",
      description: "Jugadores registrados",
    },
  ];

  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
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
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
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

              {/* Barra de progreso decorativa */}
              <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                <div
                  className={`h-1 bg-gradient-to-r ${stat.color} rounded-full transition-all duration-500`}
                  style={{
                    width:
                      teams.length > 0
                        ? `${Math.min(
                            (stat.value / Math.max(teams.length, 1)) * 100,
                            100,
                          )}%`
                        : "0%",
                  }}
                />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default StatsCards;
