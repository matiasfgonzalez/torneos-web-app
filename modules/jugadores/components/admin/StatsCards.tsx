import { StatCard, StatCardGrid } from "@/components/shared/StatCard";
import { Award, Users, Activity, UserX } from "lucide-react";

interface PropsStatsCards {
  total: number;
  activos: number;
  suspendidos: number;
  goles: number;
}

/**
 * KPIs del panel de jugadores. Recibe los contadores ya agregados desde el
 * server (`getJugadoresStats`) — no la lista completa: la tabla pagina y no
 * tendría sentido traer toda la base solo para estos números (M7).
 */
const StatsCards = ({ total, activos, suspendidos, goles }: PropsStatsCards) => {
  const denom = Math.max(total, 1);

  return (
    <StatCardGrid>
      <StatCard
        title="Total Jugadores"
        value={total}
        description="Registrados en la plataforma"
        icon={Users}
        progress={total > 0 ? 100 : 0}
      />
      <StatCard
        title="Activos"
        value={activos}
        description="Disponibles para jugar"
        icon={Activity}
        gradient="from-green-500 to-emerald-500"
        bgGradient="from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20"
        progress={(activos / denom) * 100}
      />
      <StatCard
        title="Suspendidos"
        value={suspendidos}
        description="No pueden participar"
        icon={UserX}
        gradient="from-red-500 to-rose-500"
        bgGradient="from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20"
        progress={(suspendidos / denom) * 100}
      />
      <StatCard
        title="Total Goles"
        value={goles}
        description="En la temporada actual"
        icon={Award}
        gradient="from-yellow-500 to-amber-500"
        bgGradient="from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20"
        progress={goles > 0 ? 100 : 0}
      />
    </StatCardGrid>
  );
};

export default StatsCards;
