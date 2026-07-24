import TeamForm from "@modules/equipos/components/admin/team-form";
import StatsCards from "@modules/equipos/components/admin/StatsCards";
import TeamsTable from "@modules/equipos/components/admin/TeamsTable";
import {
  getEquiposPaged,
  getEquiposStats,
} from "@modules/equipos/actions/getEquipos";
import { PageHeader, SectionTitle } from "@/components/shared/PageHeader";
import { Trophy, Users, TrendingUp } from "lucide-react";
import { parseTableParams, type RawSearchParams } from "@/lib/tableParams";

// Listado scopeado por sesión (N3) — siempre dinámico, nunca prerender
export const dynamic = "force-dynamic";

export default async function AdminEquipos({
  searchParams,
}: Readonly<{ searchParams: Promise<RawSearchParams> }>) {
  const sp = await searchParams;
  const params = parseTableParams(sp, { filterKeys: ["status"] });

  const [{ rows, total }, stats] = await Promise.all([
    getEquiposPaged(params),
    getEquiposStats(),
  ]);

  return (
    <div className="space-y-8 p-6 sm:p-8">
      {/* Header - componente compartido (patrón §3 variante A) */}
      <PageHeader
        icon={Users}
        title="Gestión de Equipos"
        statusText={`Sistema activo - ${stats.total} equipos registrados`}
        description="Administra todos los equipos registrados en la plataforma"
        quickStats={[
          {
            icon: TrendingUp,
            text: `${stats.activos} activos`,
            colorClass:
              "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300",
          },
          {
            icon: Users,
            text: `${stats.deshabilitados} deshabilitados`,
            colorClass:
              "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300",
          },
          {
            icon: Trophy,
            text: `Total: ${stats.total}`,
            colorClass:
              "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300",
          },
        ]}
        actions={<TeamForm isEditMode={false} />}
      />

      <div className="space-y-4">
        <SectionTitle>Estadísticas Generales</SectionTitle>
        <StatsCards
          total={stats.total}
          activos={stats.activos}
          deshabilitados={stats.deshabilitados}
          jugadores={stats.jugadores}
        />
      </div>

      <div className="space-y-4">
        <SectionTitle>Lista de Equipos</SectionTitle>
        <TeamsTable
          teams={rows}
          server={{
            total,
            page: params.page,
            pageSize: params.pageSize,
            q: params.q,
            sort: params.sort,
            dir: params.dir,
            filterValues: { status: params.filters.status ?? "all" },
          }}
        />
      </div>
    </div>
  );
}
