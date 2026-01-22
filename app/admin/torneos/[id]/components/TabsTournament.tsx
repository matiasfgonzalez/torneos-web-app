"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trophy, User, Target, FileText, Settings } from "lucide-react";
import { ITorneo } from "@modules/torneos/types";
import { ITeam } from "@modules/equipos/types/types";
import {
  ITournamentTeam,
  IMatch,
} from "@modules/torneos/types/tournament-teams.types";
import { useMemo } from "react";
import { formatDate } from "@/lib/formatDate";
import TabsOverview from "./tabs-tournament/TabsOverview";
import TabsTeams from "./tabs-tournament/TabsTeams";
import TabsMatches from "./tabs-tournament/TabsMatches";
import AdminStandingsSection from "@modules/torneos/components/admin/AdminStandingsSection";

interface TabsTournamentProps {
  tournamentData: ITorneo;
  equipos: ITeam[];
  associations: ITournamentTeam[];
}

export default function TabsTournament({
  tournamentData,
  equipos,
  associations,
}: Readonly<TabsTournamentProps>) {
  const teamMap = useMemo(() => {
    const m = new Map<string, ITeam>();
    equipos.forEach((t) => m.set(t.id, t));
    return m;
  }, [equipos]);

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-[#ad45ff] to-[#c77dff] rounded-xl shadow-lg shadow-[#ad45ff]/25">
          <Settings className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Gestión del Torneo
        </h2>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        {/* Premium Tab List */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#ad45ff] via-[#c77dff] to-[#a3b3ff] rounded-2xl blur opacity-20" />

          {/* Desktop TabsList */}
          <TabsList className="relative hidden md:flex w-full bg-white dark:bg-gray-900 p-2 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 gap-2 h-auto">
            <TabsTrigger
              value="overview"
              className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ad45ff] data-[state=active]:to-[#c77dff] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-[#ad45ff]/25 rounded-xl py-3 px-4 font-medium transition-all duration-300 text-gray-600 dark:text-gray-400"
            >
              <FileText className="w-4 h-4 mr-2" />
              Resumen
            </TabsTrigger>
            <TabsTrigger
              value="teams"
              className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ad45ff] data-[state=active]:to-[#c77dff] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-[#ad45ff]/25 rounded-xl py-3 px-4 font-medium transition-all duration-300 text-gray-600 dark:text-gray-400"
            >
              <User className="w-4 h-4 mr-2" />
              Equipos
            </TabsTrigger>
            <TabsTrigger
              value="matches"
              className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ad45ff] data-[state=active]:to-[#c77dff] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-[#ad45ff]/25 rounded-xl py-3 px-4 font-medium transition-all duration-300 text-gray-600 dark:text-gray-400"
            >
              <Target className="w-4 h-4 mr-2" />
              Partidos
            </TabsTrigger>
            <TabsTrigger
              value="stats"
              className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ad45ff] data-[state=active]:to-[#c77dff] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-[#ad45ff]/25 rounded-xl py-3 px-4 font-medium transition-all duration-300 text-gray-600 dark:text-gray-400"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Posiciones
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ad45ff] data-[state=active]:to-[#c77dff] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-[#ad45ff]/25 rounded-xl py-3 px-4 font-medium transition-all duration-300 text-gray-600 dark:text-gray-400"
            >
              <Settings className="w-4 h-4 mr-2" />
              Config
            </TabsTrigger>
          </TabsList>

          {/* Mobile TabsList */}
          <TabsList className="relative md:hidden flex w-full overflow-x-auto bg-white dark:bg-gray-900 p-2 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 gap-2 h-auto scrollbar-hide">
            <TabsTrigger
              value="overview"
              className="flex-shrink-0 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ad45ff] data-[state=active]:to-[#c77dff] data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl py-2.5 px-3 font-medium transition-all duration-300 text-gray-600 dark:text-gray-400"
            >
              <FileText className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger
              value="teams"
              className="flex-shrink-0 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ad45ff] data-[state=active]:to-[#c77dff] data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl py-2.5 px-3 font-medium transition-all duration-300 text-gray-600 dark:text-gray-400"
            >
              <User className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger
              value="matches"
              className="flex-shrink-0 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ad45ff] data-[state=active]:to-[#c77dff] data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl py-2.5 px-3 font-medium transition-all duration-300 text-gray-600 dark:text-gray-400"
            >
              <Target className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger
              value="stats"
              className="flex-shrink-0 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ad45ff] data-[state=active]:to-[#c77dff] data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl py-2.5 px-3 font-medium transition-all duration-300 text-gray-600 dark:text-gray-400"
            >
              <Trophy className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="flex-shrink-0 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ad45ff] data-[state=active]:to-[#c77dff] data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl py-2.5 px-3 font-medium transition-all duration-300 text-gray-600 dark:text-gray-400"
            >
              <Settings className="w-4 h-4" />
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Overview: uses TabsOverview component */}
        <TabsOverview tournamentData={tournamentData} />

        {/* Teams: Association Management - uses TabsTeams component */}
        <TabsTeams
          tournamentData={tournamentData}
          equipos={equipos}
          associations={associations}
          teamMap={teamMap}
        />

        {/* Matches: uses TabsMatches component */}
        <TabsMatches tournamentData={tournamentData} />

        {/* Stats: uses AdminStandingsSection component */}
        <TabsContent value="stats" className="space-y-6">
          <AdminStandingsSection
            tournamentTeams={associations}
            matches={(tournamentData.matches || []) as IMatch[]}
            tournamentFormat={tournamentData.format}
          />
        </TabsContent>

        {/* Settings */}
        <TabsContent value="settings" className="space-y-6">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#ad45ff] via-[#c77dff] to-[#a3b3ff] rounded-3xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300" />
            <Card className="relative bg-white dark:bg-gray-900 border-0 shadow-2xl rounded-2xl overflow-hidden">
              {/* Premium gradient accent bar */}
              <div className="h-1.5 bg-gradient-to-r from-[#ad45ff] via-[#c77dff] to-[#a3b3ff]" />

              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-[#ad45ff] to-[#c77dff] rounded-xl shadow-lg shadow-[#ad45ff]/25">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                      Configuración del Torneo
                    </CardTitle>
                    <CardDescription className="text-gray-500 dark:text-gray-400">
                      Ajustes avanzados y configuraciones del torneo
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-8">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Info Básica Card */}
                  <div className="p-5 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#ad45ff] rounded-full" />
                      Información Básica
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                          ID del Torneo
                        </span>
                        <span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-900 dark:text-white">
                          {tournamentData.id.slice(0, 8)}...
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                          Formato
                        </span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {tournamentData.format}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                          Ida y Vuelta
                        </span>
                        <span
                          className={`px-2 py-1 rounded-lg text-sm font-medium ${
                            tournamentData.homeAndAway
                              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          {tournamentData.homeAndAway ? "Sí" : "No"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Fechas Card */}
                  <div className="p-5 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#c77dff] rounded-full" />
                      Fechas
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                          Creado
                        </span>
                        <span className="text-gray-900 dark:text-white font-medium text-sm">
                          {formatDate(tournamentData.createdAt)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                          Última actualización
                        </span>
                        <span className="text-gray-900 dark:text-white font-medium text-sm">
                          {formatDate(tournamentData.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Zona de Peligro */}
                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
                    <div className="w-6 h-6 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                      <span className="text-red-600 dark:text-red-400 text-xs">
                        ⚠️
                      </span>
                    </div>
                    Zona de Peligro
                  </h4>
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-2 border-red-200 dark:border-red-800/50 rounded-xl bg-red-50/50 dark:bg-red-900/10">
                      <div>
                        <h5 className="font-semibold text-gray-900 dark:text-white">
                          Reiniciar Estadísticas
                        </h5>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Establece las estadísticas de todos los equipos a 0.
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        className="border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 bg-white dark:bg-transparent shrink-0"
                        onClick={() => {}}
                      >
                        Reiniciar
                      </Button>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-2 border-red-300 dark:border-red-700/50 rounded-xl bg-red-100/50 dark:bg-red-900/20">
                      <div>
                        <h5 className="font-semibold text-gray-900 dark:text-white">
                          Eliminar Torneo
                        </h5>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Elimina permanentemente el torneo y todos sus datos.
                        </p>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            className="bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/25 shrink-0"
                          >
                            Eliminar Torneo
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-2xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-gray-900 dark:text-white text-xl">
                              ¿Estás absolutamente seguro?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
                              Esta acción no se puede deshacer. Se eliminará
                              permanentemente el torneo{" "}
                              <strong className="text-gray-900 dark:text-white">
                                {tournamentData.name}
                              </strong>{" "}
                              y todos sus datos asociados.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700">
                              Cancelar
                            </AlertDialogCancel>
                            <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/25">
                              Sí, eliminar torneo
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
