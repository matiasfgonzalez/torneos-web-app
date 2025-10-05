import { ITorneo } from "@/components/torneos/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Clock, UserPlus, CheckCircle, TrendingUp } from "lucide-react";

interface PropsStatsCards {
  tournaments: ITorneo[];
}

const StatsCards = (props: PropsStatsCards) => {
  const { tournaments } = props;

  const stats = [
    {
      title: "Total Torneos",
      value: tournaments.length,
      icon: Trophy,
      color: "from-[#ad45ff] to-[#a3b3ff]",
      bgColor: "from-[#ad45ff]/10 to-[#a3b3ff]/10",
      description: "Torneos registrados",
    },
    {
      title: "En Curso",
      value: tournaments.filter((t) => t.status === "En curso").length,
      icon: Clock,
      color: "from-blue-500 to-cyan-500",
      bgColor: "from-blue-50 to-cyan-50",
      description: "Competencias activas",
    },
    {
      title: "Inscripciones",
      value: tournaments.filter((t) => t.status === "Inscripciones").length,
      icon: UserPlus,
      color: "from-green-500 to-emerald-500",
      bgColor: "from-green-50 to-emerald-50",
      description: "Aceptando equipos",
    },
    {
      title: "Finalizados",
      value: tournaments.filter((t) => t.status === "Finalizado").length,
      icon: CheckCircle,
      color: "from-gray-500 to-slate-500",
      bgColor: "from-gray-50 to-slate-50",
      description: "Torneos completados",
    },
  ];

  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const IconComponent = stat.icon;
        return (
          <Card
            key={stat.title}
            className="group relative overflow-hidden border-2 border-gray-100 hover:border-[#ad45ff]/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
          >
            {/* Background gradient sutil */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${stat.bgColor} opacity-50`}
            />

            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
              <div className="space-y-1">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className="text-2xl font-bold text-gray-900">
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
                <p className="text-xs text-gray-500 font-medium">
                  {stat.description}
                </p>
              </div>

              {/* Barra de progreso decorativa */}
              <div className="mt-3 w-full bg-gray-200 rounded-full h-1">
                <div
                  className={`h-1 bg-gradient-to-r ${stat.color} rounded-full transition-all duration-500`}
                  style={{
                    width:
                      tournaments.length > 0
                        ? `${Math.min(
                            (stat.value / Math.max(tournaments.length, 1)) *
                              100,
                            100
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
