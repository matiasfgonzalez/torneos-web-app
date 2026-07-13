import { ITeam } from "@modules/equipos/types/types";
import { StatCard, StatCardGrid } from "@/components/shared/StatCard";
import { Trophy, Users, CheckCircle, XCircle } from "lucide-react";

interface PropsStatsCards {
  teams: ITeam[];
}

const StatsCards = ({ teams }: PropsStatsCards) => {
  const total = Math.max(teams.length, 1);
  const activos = teams.filter((t) => t.enabled === true).length;
  const deshabilitados = teams.filter((t) => t.enabled === false).length;
  const jugadores = teams.reduce(
    (acc, t) => acc + (t.players?.length || 0),
    0,
  );

  return (
    <StatCardGrid>
      <StatCard
        title="Total Equipos"
        value={teams.length}
        description="Equipos registrados"
        icon={Trophy}
        progress={teams.length > 0 ? 100 : 0}
      />
      <StatCard
        title="Activos"
        value={activos}
        description="En competencia"
        icon={CheckCircle}
        gradient="from-green-500 to-emerald-500"
        bgGradient="from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20"
        progress={(activos / total) * 100}
      />
      <StatCard
        title="Deshabilitados"
        value={deshabilitados}
        description="No habilitados para seleccionar"
        icon={XCircle}
        gradient="from-red-500 to-rose-500"
        bgGradient="from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20"
        progress={(deshabilitados / total) * 100}
      />
      <StatCard
        title="Total Jugadores"
        value={jugadores}
        description="Jugadores registrados"
        icon={Users}
        gradient="from-blue-500 to-cyan-500"
        bgGradient="from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20"
        progress={(jugadores / Math.max(jugadores, 1)) * 100}
      />
    </StatCardGrid>
  );
};

export default StatsCards;
