import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Trophy,
  Users,
  Play,
  TrendingUp,
  Target,
  Award,
  CircleDot,
} from "lucide-react";

interface PropsQuickStats {
  teamData: any; // Using any to match the structure from getEquipoById
}

const QuickStats = (props: PropsQuickStats) => {
  const { teamData } = props;
  const { estadisticas } = teamData;

  const stats = [
    {
      title: "Torneos",
      value: estadisticas.totalTorneos || 0,
      icon: Trophy,
      gradient: "from-yellow-400 to-orange-500",
      bg: "bg-orange-50 dark:bg-orange-900/10",
      text: "text-orange-600 dark:text-orange-400",
      label: "Participaciones",
    },
    {
      title: "Jugadores",
      value: teamData.jugadores?.length || 0,
      icon: Users,
      gradient: "from-blue-400 to-indigo-500",
      bg: "bg-blue-50 dark:bg-blue-900/10",
      text: "text-blue-600 dark:text-blue-400",
      label: "En plantel",
    },
    {
      title: "Partidos",
      value: estadisticas.totalPartidos || 0,
      icon: Play,
      gradient: "from-green-400 to-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-900/10",
      text: "text-emerald-600 dark:text-emerald-400",
      label: "Jugados",
    },
    {
      title: "Puntos",
      value: estadisticas.totalPuntos || 0,
      icon: Award,
      gradient: "from-purple-400 to-pink-500",
      bg: "bg-pink-50 dark:bg-pink-900/10",
      text: "text-pink-600 dark:text-pink-400",
      label: "Acumulados",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={index}
            className="border-0 shadow-lg bg-white dark:bg-gray-800 overflow-hidden relative group hover:-translate-y-1 transition-transform duration-300"
          >
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 bg-gradient-to-r ${stat.gradient}`} />
            
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex flex-col space-y-1">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {stat.title}
                  </span>
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                    <CircleDot className="w-3 h-3" />
                    {stat.label}
                  </span>
                </div>
                <div
                  className={`p-3 rounded-2xl bg-gradient-to-br ${stat.gradient} shadow-lg text-white transform group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default QuickStats;

