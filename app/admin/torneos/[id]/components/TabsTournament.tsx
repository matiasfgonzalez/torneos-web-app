"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { ITorneo } from "@/components/torneos/types";
import { ITeam } from "@/components/equipos/types";
import { ITournamentTeam } from "@/components/tournament-teams/types";
import { useMemo } from "react";
import { formatDate } from "@/lib/formatDate";
import TabsOverview from "./tabs-tournament/TabsOverview";
import TabsTeams from "./tabs-tournament/TabsTeams";
import TabsMatches from "./tabs-tournament/TabsMatches";

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

  // Sort by points desc, then goalDifference desc, then goalsFor desc
  const standings = useMemo(() => {
    // Sort by points desc, then goalDifference desc, then goalsFor desc
    return associations.sort((a, b) => {
      if (a.points !== b.points) return b.points - a.points; // Ordenar por puntos
      if (a.wins !== b.wins) return b.wins - a.wins; // Luego por victorias
      if (a.goalDifference !== b.goalDifference)
        return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor; // Luego por goles a favor
    });
  }, [associations]);

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="w-1 h-6 bg-gradient-to-b from-[#ad45ff] to-[#a3b3ff] rounded-full" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Gestión del Torneo
        </h2>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        {/* Desktop TabsList */}
        <TabsList className="hidden md:grid w-full grid-cols-5 bg-gradient-to-r from-[#ad45ff]/10 to-[#a3b3ff]/10 dark:from-[#8b39cc]/20 dark:to-[#829bd9]/20 border border-[#ad45ff]/20 dark:border-[#8b39cc]/30 shadow-lg">
          <TabsTrigger
            value="overview"
            className="cursor-pointer data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ad45ff] data-[state=active]:to-[#a3b3ff] data-[state=active]:text-white font-medium transition-all duration-200 text-gray-700 dark:text-gray-300"
          >
            <FileText className="w-4 h-4 mr-1" />
            Resumen
          </TabsTrigger>
          <TabsTrigger
            value="teams"
            className="cursor-pointer data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ad45ff] data-[state=active]:to-[#a3b3ff] data-[state=active]:text-white font-medium transition-all duration-200 text-gray-700 dark:text-gray-300"
          >
            <User className="w-4 h-4 mr-1" />
            Equipos
          </TabsTrigger>
          <TabsTrigger
            value="matches"
            className="cursor-pointer data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ad45ff] data-[state=active]:to-[#a3b3ff] data-[state=active]:text-white font-medium transition-all duration-200 text-gray-700 dark:text-gray-300"
          >
            <Target className="w-4 h-4 mr-1" />
            Partidos
          </TabsTrigger>
          <TabsTrigger
            value="stats"
            className="cursor-pointer data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ad45ff] data-[state=active]:to-[#a3b3ff] data-[state=active]:text-white font-medium transition-all duration-200 text-gray-700 dark:text-gray-300"
          >
            <Trophy className="w-4 h-4 mr-1" />
            Estadísticas
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="cursor-pointer data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ad45ff] data-[state=active]:to-[#a3b3ff] data-[state=active]:text-white font-medium transition-all duration-200 text-gray-700 dark:text-gray-300"
          >
            <Settings className="w-4 h-4 mr-1" />
            Configuración
          </TabsTrigger>
        </TabsList>

        {/* Mobile TabsList - Scrollable horizontal */}
        <div className="md:hidden">
          <TabsList className="flex w-full overflow-x-auto bg-gradient-to-r from-[#ad45ff]/10 to-[#a3b3ff]/10 dark:from-[#8b39cc]/20 dark:to-[#829bd9]/20 border border-[#ad45ff]/20 dark:border-[#8b39cc]/30 shadow-lg p-1 gap-1 scrollbar-hide">
            <TabsTrigger
              value="overview"
              className="cursor-pointer data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ad45ff] data-[state=active]:to-[#a3b3ff] data-[state=active]:text-white font-medium transition-all duration-200 text-gray-700 dark:text-gray-300 flex-shrink-0 px-3 py-2 rounded-md"
            >
              <FileText className="w-4 h-4" />
              <span className="ml-1 hidden sm:inline">Resumen</span>
            </TabsTrigger>
            <TabsTrigger
              value="teams"
              className="cursor-pointer data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ad45ff] data-[state=active]:to-[#a3b3ff] data-[state=active]:text-white font-medium transition-all duration-200 text-gray-700 dark:text-gray-300 flex-shrink-0 px-3 py-2 rounded-md"
            >
              <User className="w-4 h-4" />
              <span className="ml-1 hidden sm:inline">Equipos</span>
            </TabsTrigger>
            <TabsTrigger
              value="matches"
              className="cursor-pointer data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ad45ff] data-[state=active]:to-[#a3b3ff] data-[state=active]:text-white font-medium transition-all duration-200 text-gray-700 dark:text-gray-300 flex-shrink-0 px-3 py-2 rounded-md"
            >
              <Target className="w-4 h-4" />
              <span className="ml-1 hidden sm:inline">Partidos</span>
            </TabsTrigger>
            <TabsTrigger
              value="stats"
              className="cursor-pointer data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ad45ff] data-[state=active]:to-[#a3b3ff] data-[state=active]:text-white font-medium transition-all duration-200 text-gray-700 dark:text-gray-300 flex-shrink-0 px-3 py-2 rounded-md"
            >
              <Trophy className="w-4 h-4" />
              <span className="ml-1 hidden sm:inline">Stats</span>
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="cursor-pointer data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ad45ff] data-[state=active]:to-[#a3b3ff] data-[state=active]:text-white font-medium transition-all duration-200 text-gray-700 dark:text-gray-300 flex-shrink-0 px-3 py-2 rounded-md"
            >
              <Settings className="w-4 h-4" />
              <span className="ml-1 hidden sm:inline">Config</span>
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

        {/* Stats: uses current associations to render tabla de posiciones */}
        <TabsContent value="stats" className="space-y-4">
          <Card className="border-2 border-[#ad45ff]/20 dark:border-[#8b39cc]/30 shadow-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
            <CardHeader className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] rounded-xl flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                    Tabla de Posiciones
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">
                    Ordenada por puntos, diferencia de gol y goles a favor
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border-2 border-gray-100 dark:border-gray-700 overflow-hidden">
                <Table>
                  <TableHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                    <TableRow className="hover:bg-gray-100/50 dark:hover:bg-gray-700/50">
                      <TableHead className="font-semibold text-gray-900 dark:text-white">
                        Pos
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900 dark:text-white">
                        Equipo
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900 dark:text-white text-center">
                        PJ
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900 dark:text-white text-center">
                        G
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900 dark:text-white text-center">
                        E
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900 dark:text-white text-center">
                        P
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900 dark:text-white text-center">
                        GF
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900 dark:text-white text-center">
                        GC
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900 dark:text-white text-center">
                        DG
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900 dark:text-white text-center">
                        Pts
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {standings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-12">
                          <div className="space-y-3">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto">
                              <Trophy className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 font-medium">
                              No hay equipos registrados en este torneo
                            </p>
                            <p className="text-sm text-gray-400 dark:text-gray-500">
                              Agrega equipos en la pestaña Equipos para ver la
                              tabla de posiciones
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      standings.map((row, idx) => {
                        const team = teamMap.get(row.teamId);
                        const positionClass =
                          idx === 0
                            ? "bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-l-4 border-yellow-400"
                            : idx <= 2
                            ? "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-l-4 border-green-400"
                            : idx >= standings.length - 3
                            ? "bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-l-4 border-red-400"
                            : "hover:bg-gray-50/50 dark:hover:bg-gray-700/50";

                        return (
                          <TableRow
                            key={row.id}
                            className={`transition-colors duration-200 ${positionClass}`}
                          >
                            <TableCell className="font-bold text-center">
                              <div className="flex items-center justify-center">
                                {idx === 0 && (
                                  <Trophy className="w-4 h-4 text-yellow-500 mr-1" />
                                )}
                                {idx + 1}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-600">
                                  <img
                                    src={
                                      team?.logoUrl ||
                                      "/placeholder.svg?height=32&width=32"
                                    }
                                    alt={team?.name || "Equipo"}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {team?.name || "Equipo desconocido"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center font-medium">
                              {row.matchesPlayed}
                            </TableCell>
                            <TableCell className="text-center font-medium text-green-600">
                              {row.wins}
                            </TableCell>
                            <TableCell className="text-center font-medium text-gray-600">
                              {row.draws}
                            </TableCell>
                            <TableCell className="text-center font-medium text-red-600">
                              {row.losses}
                            </TableCell>
                            <TableCell className="text-center font-medium">
                              {row.goalsFor}
                            </TableCell>
                            <TableCell className="text-center font-medium">
                              {row.goalsAgainst}
                            </TableCell>
                            <TableCell className="text-center font-medium">
                              <span
                                className={
                                  row.goalDifference >= 0
                                    ? "text-green-600"
                                    : "text-red-600"
                                }
                              >
                                {row.goalDifference > 0 ? "+" : ""}
                                {row.goalDifference}
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className="font-bold text-lg bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] bg-clip-text text-transparent">
                                {row.points}
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings */}
        <TabsContent value="settings" className="space-y-4">
          <Card className="border-2 border-[#ad45ff]/20 dark:border-[#8b39cc]/30 shadow-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">
                Configuración del Torneo
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Ajustes avanzados y configuraciones del torneo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2 text-gray-900 dark:text-white">
                    Información Básica
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">
                        ID del Torneo:
                      </span>
                      <span className="font-mono text-gray-900 dark:text-white">
                        {tournamentData.id}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">
                        Formato:
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {tournamentData.format}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">
                        Ida y Vuelta:
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {tournamentData.homeAndAway ? "Sí" : "No"}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2 text-gray-900 dark:text-white">
                    Fechas
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">
                        Creado:
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {formatDate(tournamentData.createdAt)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">
                        Última actualización:
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {formatDate(tournamentData.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t dark:border-gray-700 pt-6">
                <h4 className="font-medium mb-4 text-red-600 dark:text-red-400">
                  Zona de Peligro
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50/50 dark:bg-red-900/10">
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white">
                        Reiniciar Estadísticas de Equipos
                      </h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Establece las estadísticas de todos los equipos del
                        torneo a 0.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 bg-transparent"
                      onClick={() => {}}
                    >
                      Reiniciar
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50/50 dark:bg-red-900/10">
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white">
                        Eliminar Torneo
                      </h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Elimina permanentemente el torneo y todos sus datos.
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">Eliminar</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-gray-900 dark:text-white">
                            ¿Estás absolutamente seguro?
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
                            Esta acción no se puede deshacer. Se eliminará
                            permanentemente el torneo{" "}
                            <strong className="text-gray-900 dark:text-white">
                              {tournamentData.name}
                            </strong>{" "}
                            y todos sus datos asociados.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600">
                            Cancelar
                          </AlertDialogCancel>
                          <AlertDialogAction className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
