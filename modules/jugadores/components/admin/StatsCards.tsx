import { IPlayer } from "@modules/jugadores/types";
import { StatCard, StatCardGrid } from "@/components/shared/StatCard";
import { Award, Users, Activity, UserX } from "lucide-react";

interface PropsStatsCards {
  players: IPlayer[];
}

const StatsCards = ({ players }: PropsStatsCards) => {
  const total = Math.max(players.length, 1);
  // Enum real de Prisma: ACTIVO/SUSPENDIDO (antes comparaba "ACTIVE"/"SUSPENDED" → siempre 0)
  const activos = players.filter((p) => p.status === "ACTIVO").length;
  const suspendidos = players.filter((p) => p.status === "SUSPENDIDO").length;
  const goles = players.reduce(
    (sum, player) => sum + (player.goals ? player.goals.length : 0),
    0,
  );

  return (
    <StatCardGrid>
      <StatCard
        title="Total Jugadores"
        value={players.length}
        description="Registrados en la plataforma"
        icon={Users}
        progress={players.length > 0 ? 100 : 0}
      />
      <StatCard
        title="Activos"
        value={activos}
        description="Disponibles para jugar"
        icon={Activity}
        gradient="from-green-500 to-emerald-500"
        bgGradient="from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20"
        progress={(activos / total) * 100}
      />
      <StatCard
        title="Suspendidos"
        value={suspendidos}
        description="No pueden participar"
        icon={UserX}
        gradient="from-red-500 to-rose-500"
        bgGradient="from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20"
        progress={(suspendidos / total) * 100}
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
