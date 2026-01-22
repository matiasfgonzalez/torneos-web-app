import Header from "./components/Header";
import QuickStats from "./components/QuickStats";
import { getTorneoById } from "@modules/torneos/actions/getTorneoById";
import TabsTournament from "./components/TabsTournament";
import { getEquipos } from "@modules/equipos/actions/getEquipos";
import { getTournamentTeams } from "@modules/torneos/actions/getTournamentTeams";
import { AlertTriangle, ArrowLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default async function AdminTournamentDetail({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;
  const torneo = await getTorneoById(id);
  const equipos = await getEquipos();
  const associations = await getTournamentTeams(id);

  if (torneo) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="space-y-8 p-6 sm:p-8 max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Link
              href="/admin/dashboard"
              className="hover:text-[#ad45ff] transition-colors"
            >
              Dashboard
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link
              href="/admin/torneos"
              className="hover:text-[#ad45ff] transition-colors"
            >
              Torneos
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 dark:text-white font-medium truncate max-w-[200px]">
              {torneo.name}
            </span>
          </nav>

          {/* Header mejorado */}
          <Header tournamentData={torneo} />

          {/* Status and Quick Stats mejoradas */}
          <QuickStats tournamentData={torneo} />

          {/* Tabs con diseño mejorado */}
          <TabsTournament
            tournamentData={torneo}
            equipos={equipos}
            associations={associations}
          />
        </div>
      </div>
    );
  } else {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-6">
        <Card className="max-w-md w-full border-0 shadow-2xl bg-white dark:bg-gray-900 rounded-2xl overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-red-500 via-red-400 to-orange-500" />
          <CardContent className="text-center p-12 space-y-6">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500/20 to-orange-500/10 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Torneo no encontrado
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                El torneo que buscas no existe o ha sido eliminado.
              </p>
            </div>

            <div className="pt-4">
              <Button
                asChild
                className="rounded-full px-8 bg-gradient-to-r from-[#ad45ff] to-[#c77dff] hover:from-[#9d35ef] hover:to-[#b56dff] text-white shadow-lg shadow-[#ad45ff]/25 border-0"
              >
                <Link href="/admin/torneos" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Volver a Torneos</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
}
