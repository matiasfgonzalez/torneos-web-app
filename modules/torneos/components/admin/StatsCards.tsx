import { StatCard, StatCardGrid } from "@/components/shared/StatCard";
import { Trophy, Clock, UserPlus, CheckCircle } from "lucide-react";

interface PropsStatsCards {
  total: number;
  activos: number;
  inscripciones: number;
  finalizados: number;
}

/** KPIs del panel de torneos — contadores agregados desde el server (M7). */
const StatsCards = ({
  total,
  activos,
  inscripciones,
  finalizados,
}: PropsStatsCards) => {
  const denom = Math.max(total, 1);

  return (
    <StatCardGrid>
      <StatCard
        title="Total Torneos"
        value={total}
        description="Torneos registrados"
        icon={Trophy}
        progress={total > 0 ? 100 : 0}
      />
      <StatCard
        title="En Curso"
        value={activos}
        description="Competencias activas"
        icon={Clock}
        gradient="from-blue-500 to-cyan-500"
        bgGradient="from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20"
        progress={(activos / denom) * 100}
      />
      <StatCard
        title="Inscripciones"
        value={inscripciones}
        description="Aceptando equipos"
        icon={UserPlus}
        gradient="from-green-500 to-emerald-500"
        bgGradient="from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20"
        progress={(inscripciones / denom) * 100}
      />
      <StatCard
        title="Finalizados"
        value={finalizados}
        description="Torneos completados"
        icon={CheckCircle}
        gradient="from-gray-500 to-slate-500"
        bgGradient="from-gray-50 to-slate-50 dark:from-gray-800/20 dark:to-slate-800/20"
        progress={(finalizados / denom) * 100}
      />
    </StatCardGrid>
  );
};

export default StatsCards;
