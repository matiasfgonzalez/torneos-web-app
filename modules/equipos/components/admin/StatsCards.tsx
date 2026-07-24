import { StatCard, StatCardGrid } from "@/components/shared/StatCard";
import { Trophy, Users, CheckCircle, XCircle } from "lucide-react";

interface PropsStatsCards {
  total: number;
  activos: number;
  deshabilitados: number;
  jugadores: number;
}

/** KPIs del panel de equipos — contadores agregados desde el server (M7). */
const StatsCards = ({
  total,
  activos,
  deshabilitados,
  jugadores,
}: PropsStatsCards) => {
  const denom = Math.max(total, 1);

  return (
    <StatCardGrid>
      <StatCard
        title="Total Equipos"
        value={total}
        description="Equipos registrados"
        icon={Trophy}
        progress={total > 0 ? 100 : 0}
      />
      <StatCard
        title="Activos"
        value={activos}
        description="En competencia"
        icon={CheckCircle}
        gradient="from-green-500 to-emerald-500"
        bgGradient="from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20"
        progress={(activos / denom) * 100}
      />
      <StatCard
        title="Deshabilitados"
        value={deshabilitados}
        description="No habilitados para seleccionar"
        icon={XCircle}
        gradient="from-red-500 to-rose-500"
        bgGradient="from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20"
        progress={(deshabilitados / denom) * 100}
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
