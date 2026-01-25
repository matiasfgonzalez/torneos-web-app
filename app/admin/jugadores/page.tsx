import StatsCards from "./components/StatsCards";
import PlayersTable from "./components/PlayersTable";
import PlayerForm from "./components/player-form";
import { getJugadores } from "@modules/jugadores/actions/getJugadores";
import { Users, Activity, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default async function AdminJugadores() {
  const players = await getJugadores();

  const activePlayers = players.filter((p) => p.status === "ACTIVE").length;
  const suspendedPlayers = players.filter(
    (p) => p.status === "SUSPENDED",
  ).length;
  const totalGoals = players.reduce(
    (sum, player) => sum + (player.goals ? player.goals.length : 0),
    0,
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900/50">
      <div className="space-y-8 p-6 sm:p-8">
        {/* Header mejorado */}
        <div className="relative">
          {/* Background decorativo */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#ad45ff]/5 to-[#a3b3ff]/5 dark:from-[#ad45ff]/10 dark:to-[#a3b3ff]/10 rounded-3xl -z-10" />

          <Card className="border-2 border-[#ad45ff]/20 dark:border-[#ad45ff]/30 shadow-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] rounded-2xl flex items-center justify-center shadow-lg">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] bg-clip-text text-transparent">
                        Gestión de Jugadores
                      </h1>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <p className="text-gray-600 dark:text-gray-300 font-medium">
                          Sistema activo - {players.length} jugadores
                          registrados
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed">
                    Administra todos los jugadores registrados en la plataforma
                  </p>

                  {/* Quick stats inline */}
                  <div className="flex flex-wrap gap-4 pt-2">
                    <div className="flex items-center space-x-2 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full">
                      <Activity className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium text-green-700 dark:text-green-300">
                        {activePlayers} activos
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full">
                      <Users className="w-4 h-4 text-red-600 dark:text-red-400" />
                      <span className="text-sm font-medium text-red-700 dark:text-red-300">
                        {suspendedPlayers} suspendidos
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1 rounded-full">
                      <Award className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                      <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                        {totalGoals} goles
                      </span>
                    </div>
                  </div>
                </div>

                <div className="w-full lg:w-auto">
                  {/* Formulario de Creación */}
                  <PlayerForm isEditMode={false} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards mejoradas */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="w-1 h-6 bg-gradient-to-b from-[#ad45ff] to-[#a3b3ff] rounded-full" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Estadísticas Generales
            </h2>
          </div>
          <StatsCards players={players} />
        </div>

        {/* Lista de jugadores mejorada */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="w-1 h-6 bg-gradient-to-b from-[#ad45ff] to-[#a3b3ff] rounded-full" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Lista de Jugadores
            </h2>
          </div>
          <PlayersTable players={players} />
        </div>
      </div>
    </div>
  );
}
