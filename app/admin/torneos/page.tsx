import StatsCards from "@modules/torneos/components/admin/StatsCards";
import ListTournaments from "@modules/torneos/components/admin/ListTournaments";
import DialogAddTournaments from "@modules/torneos/components/admin/DialogAddTournaments";
import { getAdminTorneos } from "@modules/torneos/actions/getTorneos";
import { PageHeader } from "@/components/shared/PageHeader";
import { Trophy, TrendingUp, Calendar, Users } from "lucide-react";
import { TournamentStatus } from "@prisma/client";

// Listado scopeado por sesión (N3) — siempre dinámico, nunca prerender
export const dynamic = "force-dynamic";

export default async function AdminTorneos() {
  const tournaments = await getAdminTorneos();

  return (
    <div className="min-h-screen">
      <div className="space-y-8 p-6 sm:p-8">
        {/* Header - componente compartido F0 (patrón §3 variante A) */}
        <PageHeader
          icon={Trophy}
          title="Gestión de Torneos"
          statusText={`Sistema activo - ${tournaments.length} torneos registrados`}
          description="Administra todos los torneos de la plataforma con herramientas profesionales para crear, editar y gestionar competencias deportivas"
          quickStats={[
            {
              icon: TrendingUp,
              text: `${tournaments.filter((t) => t.status === TournamentStatus.ACTIVO).length} activos`,
              colorClass:
                "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300",
            },
            {
              icon: Calendar,
              text: `${tournaments.filter((t) => t.status === TournamentStatus.INSCRIPCION).length} inscribiendo`,
              colorClass:
                "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300",
            },
            {
              icon: Users,
              text: `Total: ${tournaments.length}`,
              colorClass:
                "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300",
            },
          ]}
          actions={<DialogAddTournaments />}
        />

        {/* Stats Cards mejoradas */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="w-1 h-6 bg-gradient-to-b from-[#ad45ff] to-[#a3b3ff] rounded-full" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Estadísticas Generales
            </h2>
          </div>
          <StatsCards tournaments={tournaments} />
        </div>

        {/* Lista de torneos mejorada */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="w-1 h-6 bg-gradient-to-b from-[#ad45ff] to-[#a3b3ff] rounded-full" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Administración de Torneos
            </h2>
          </div>
          <ListTournaments tournaments={tournaments} />
        </div>
      </div>
    </div>
  );
}
