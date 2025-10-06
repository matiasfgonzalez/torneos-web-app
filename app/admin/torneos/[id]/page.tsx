import Header from "./components/Header";
import QuickStats from "./components/QuickStats";
import { getTorneoById } from "@/app/actions/torneos/getTorneoById";
import TabsTournament from "./components/TabsTournament";
import { getEquipos } from "@/app/actions/equipos/getEquipos";
import { getTournamentTeams } from "@/app/actions/tournament-teams/getTournamentTeams";
import { AlertTriangle, ArrowLeft } from "lucide-react";
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900/50">
        <div className="space-y-8 p-6 sm:p-8">
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900/50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full border-2 border-red-200 dark:border-red-800 shadow-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
          <CardContent className="text-center p-8 space-y-6">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-red-500 dark:text-red-400" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Torneo no encontrado
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                El torneo que buscas no existe o ha sido eliminado.
              </p>
            </div>

            <div className="pt-4">
              <Button
                asChild
                className="bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] dark:from-[#8b39cc] dark:to-[#829bd9] hover:from-[#9d35ef] hover:to-[#93a3ef] dark:hover:from-[#7a32b8] dark:hover:to-[#7189c5] text-white transition-all duration-300"
              >
                <Link
                  href="/admin/torneos"
                  className="flex items-center space-x-2"
                >
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
