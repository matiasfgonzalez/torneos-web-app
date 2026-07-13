import TeamForm from "@modules/equipos/components/admin/team-form";
import StatsCards from "@modules/equipos/components/admin/StatsCards";
import TeamsTable from "@modules/equipos/components/admin/TeamsTable";
import { getAdminEquipos } from "@modules/equipos/actions/getEquipos";
import { PageHeader, SectionTitle } from "@/components/shared/PageHeader";
import { Trophy, Users, TrendingUp } from "lucide-react";

// Listado scopeado por sesión (N3) — siempre dinámico, nunca prerender
export const dynamic = "force-dynamic";

export default async function AdminEquipos() {
  const teams = await getAdminEquipos();

  const activeTeams = teams.filter((t) => t.enabled === true).length;
  const disabledTeams = teams.filter((t) => t.enabled === false).length;

  return (
    <div className="space-y-8 p-6 sm:p-8">
      {/* Header - componente compartido (patrón §3 variante A) */}
      <PageHeader
        icon={Users}
        title="Gestión de Equipos"
        statusText={`Sistema activo - ${teams.length} equipos registrados`}
        description="Administra todos los equipos registrados en la plataforma"
        quickStats={[
          {
            icon: TrendingUp,
            text: `${activeTeams} activos`,
            colorClass:
              "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300",
          },
          {
            icon: Users,
            text: `${disabledTeams} deshabilitados`,
            colorClass:
              "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300",
          },
          {
            icon: Trophy,
            text: `Total: ${teams.length}`,
            colorClass:
              "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300",
          },
        ]}
        actions={<TeamForm isEditMode={false} />}
      />

      <div className="space-y-4">
        <SectionTitle>Estadísticas Generales</SectionTitle>
        <StatsCards teams={teams} />
      </div>

      <div className="space-y-4">
        <SectionTitle>Lista de Equipos</SectionTitle>
        <TeamsTable teams={teams} />
      </div>
    </div>
  );
}
