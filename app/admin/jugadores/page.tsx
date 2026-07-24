import StatsCards from "@modules/jugadores/components/admin/StatsCards";
import PlayersTable from "@modules/jugadores/components/admin/PlayersTable";
import PlayerForm from "@modules/jugadores/components/admin/player-form";
import {
  getJugadoresPaged,
  getJugadoresStats,
} from "@modules/jugadores/actions/getJugadores";
import { PageHeader, SectionTitle } from "@/components/shared/PageHeader";
import { Users, Activity, Award } from "lucide-react";
import { parseTableParams, type RawSearchParams } from "@/lib/tableParams";

// Listado scopeado por sesión (N3) — siempre dinámico, nunca prerender
export const dynamic = "force-dynamic";

export default async function AdminJugadores({
  searchParams,
}: Readonly<{ searchParams: Promise<RawSearchParams> }>) {
  const sp = await searchParams;
  // Estado de la tabla (página/búsqueda/filtro/orden) vive en la URL (M7).
  const params = parseTableParams(sp, { filterKeys: ["status"] });

  const [{ rows, total }, stats] = await Promise.all([
    getJugadoresPaged(params),
    getJugadoresStats(),
  ]);

  return (
    <div className="space-y-8 p-6 sm:p-8">
      {/* Header - componente compartido (patrón §3 variante A) */}
      <PageHeader
        icon={Users}
        title="Gestión de Jugadores"
        statusText={`Sistema activo - ${stats.total} jugadores registrados`}
        description="Administra todos los jugadores registrados en la plataforma"
        quickStats={[
          {
            icon: Activity,
            text: `${stats.activos} activos`,
            colorClass:
              "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300",
          },
          {
            icon: Users,
            text: `${stats.suspendidos} suspendidos`,
            colorClass:
              "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300",
          },
          {
            icon: Award,
            text: `${stats.goles} goles`,
            colorClass:
              "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300",
          },
        ]}
        actions={<PlayerForm isEditMode={false} />}
      />

      <div className="space-y-4">
        <SectionTitle>Estadísticas Generales</SectionTitle>
        <StatsCards
          total={stats.total}
          activos={stats.activos}
          suspendidos={stats.suspendidos}
          goles={stats.goles}
        />
      </div>

      <div className="space-y-4">
        <SectionTitle>Lista de Jugadores</SectionTitle>
        <PlayersTable
          players={rows}
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
