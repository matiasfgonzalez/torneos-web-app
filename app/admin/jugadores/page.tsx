import StatsCards from "@modules/jugadores/components/admin/StatsCards";
import PlayersTable from "@modules/jugadores/components/admin/PlayersTable";
import PlayerForm from "@modules/jugadores/components/admin/player-form";
import { getJugadores } from "@modules/jugadores/actions/getJugadores";
import { PageHeader, SectionTitle } from "@/components/shared/PageHeader";
import { Users, Activity, Award } from "lucide-react";

// Listado scopeado por sesión (N3) — siempre dinámico, nunca prerender
export const dynamic = "force-dynamic";

export default async function AdminJugadores() {
  const players = await getJugadores();

  // Enum real de Prisma: ACTIVO/SUSPENDIDO (antes comparaba "ACTIVE"/"SUSPENDED" → siempre 0)
  const activePlayers = players.filter((p) => p.status === "ACTIVO").length;
  const suspendedPlayers = players.filter(
    (p) => p.status === "SUSPENDIDO",
  ).length;
  const totalGoals = players.reduce(
    (sum, player) => sum + (player.goals ? player.goals.length : 0),
    0,
  );

  return (
    <div className="space-y-8 p-6 sm:p-8">
      {/* Header - componente compartido (patrón §3 variante A) */}
      <PageHeader
        icon={Users}
        title="Gestión de Jugadores"
        statusText={`Sistema activo - ${players.length} jugadores registrados`}
        description="Administra todos los jugadores registrados en la plataforma"
        quickStats={[
          {
            icon: Activity,
            text: `${activePlayers} activos`,
            colorClass:
              "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300",
          },
          {
            icon: Users,
            text: `${suspendedPlayers} suspendidos`,
            colorClass:
              "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300",
          },
          {
            icon: Award,
            text: `${totalGoals} goles`,
            colorClass:
              "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300",
          },
        ]}
        actions={<PlayerForm isEditMode={false} />}
      />

      <div className="space-y-4">
        <SectionTitle>Estadísticas Generales</SectionTitle>
        <StatsCards players={players} />
      </div>

      <div className="space-y-4">
        <SectionTitle>Lista de Jugadores</SectionTitle>
        <PlayersTable players={players} />
      </div>
    </div>
  );
}
