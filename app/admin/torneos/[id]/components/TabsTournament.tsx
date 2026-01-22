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
import { ITorneo } from "@modules/torneos/types";
import { ITeam } from "@modules/equipos/types/types";
import { ITournamentTeam } from "@modules/torneos/types/tournament-teams.types";
import { useMemo, useState } from "react";
import { formatDate } from "@/lib/formatDate";
import TabsOverview from "./tabs-tournament/TabsOverview";
import TabsTeams from "./tabs-tournament/TabsTeams";
import TabsMatches from "./tabs-tournament/TabsMatches";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [selectedPhase, setSelectedPhase] = useState<string>("all");

  const teamMap = useMemo(() => {
    const m = new Map<string, ITeam>();
    equipos.forEach((t) => m.set(t.id, t));
    return m;
  }, [equipos]);

  // Derivar fases disponibles
  const availablePhases = useMemo(() => {
    const phases = new Map<string, string>();
    associations.forEach((assoc) => {
      assoc.phaseStats?.forEach((stat) => {
        // Obtenemos el nombre de la fase desde tournamentPhase (si existe)
        const phaseName =
          (stat as any).tournamentPhase?.name || "Fase desconocida";
        phases.set(stat.tournamentPhaseId, phaseName);
      });
    });
    return Array.from(phases.entries()).map(([id, name]) => ({ id, name }));
  }, [associations]);

  // Calcular standings basado en fase seleccionada
  const standings = useMemo(() => {
    const data = associations.map((assoc) => {
      if (selectedPhase === "all") {
        return {
          id: assoc.id,
          teamId: assoc.teamId,
          matchesPlayed: assoc.matchesPlayed,
          wins: assoc.wins,
          draws: assoc.draws,
          losses: assoc.losses,
          goalsFor: assoc.goalsFor,
          goalsAgainst: assoc.goalsAgainst,
          goalDifference: assoc.goalDifference,
          points: assoc.points,
        };
      } else {
        // Buscar stats de la fase
        const phaseStat = assoc.phaseStats?.find(
          (s) => s.tournamentPhaseId === selectedPhase,
        );
        if (phaseStat) {
          return {
            id: assoc.id,
            teamId: assoc.teamId,
            matchesPlayed: phaseStat.matchesPlayed,
            wins: phaseStat.wins,
            draws: phaseStat.draws,
            losses: phaseStat.losses,
            goalsFor: phaseStat.goalsFor,
            goalsAgainst: phaseStat.goalsAgainst,
            goalDifference: phaseStat.goalDifference,
            points: phaseStat.points,
          };
        }
        // Si no tiene stats en esta fase, devolver 0
        return {
          id: assoc.id,
          teamId: assoc.teamId,
          matchesPlayed: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
          points: 0,
        };
      }
    });

    // Ordenar
    return data.sort((a, b) => {
      if (a.points !== b.points) return b.points - a.points;
      if (a.wins !== b.wins) return b.wins - a.wins;
      if (a.goalDifference !== b.goalDifference)
        return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    });
  }, [associations, selectedPhase]);

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

        {/* Stats: uses current associations to render tabla de posiciones */}
        <TabsContent value="stats" className="space-y-6">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#ad45ff] via-[#c77dff] to-[#a3b3ff] rounded-3xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300" />
            <Card className="relative bg-white dark:bg-gray-900 border-0 shadow-2xl rounded-2xl overflow-hidden">
              {/* Premium gradient accent bar */}
              <div className="h-1.5 bg-gradient-to-r from-[#ad45ff] via-[#c77dff] to-[#a3b3ff]" />

              <CardHeader className="space-y-4 pb-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-[#ad45ff] to-[#c77dff] rounded-xl shadow-lg shadow-[#ad45ff]/25">
                      <Trophy className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                        Tabla de Posiciones
                      </CardTitle>
                      <CardDescription className="text-gray-500 dark:text-gray-400">
                        Ordenada por puntos, diferencia de gol y goles a favor
                      </CardDescription>
                    </div>
                  </div>

                  <div className="w-full md:w-64">
                    <Select
                      value={selectedPhase}
                      onValueChange={setSelectedPhase}
                    >
                      <SelectTrigger className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-[#ad45ff] focus:border-[#ad45ff]">
                        <SelectValue placeholder="Seleccionar fase" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <SelectItem value="all">Tabla General</SelectItem>
                        {availablePhases.map((phase) => (
                          <SelectItem key={phase.id} value={phase.id}>
                            {phase.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pb-6">
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/80">
                      <TableRow className="hover:bg-transparent border-b border-gray-200 dark:border-gray-700">
                        <TableHead className="font-bold text-gray-900 dark:text-white text-center w-12">
                          #
                        </TableHead>
                        <TableHead className="font-bold text-gray-900 dark:text-white">
                          Equipo
                        </TableHead>
                        <TableHead className="font-bold text-gray-900 dark:text-white text-center hidden sm:table-cell">
                          PJ
                        </TableHead>
                        <TableHead className="font-bold text-gray-900 dark:text-white text-center hidden md:table-cell">
                          G
                        </TableHead>
                        <TableHead className="font-bold text-gray-900 dark:text-white text-center hidden md:table-cell">
                          E
                        </TableHead>
                        <TableHead className="font-bold text-gray-900 dark:text-white text-center hidden md:table-cell">
                          P
                        </TableHead>
                        <TableHead className="font-bold text-gray-900 dark:text-white text-center hidden lg:table-cell">
                          GF
                        </TableHead>
                        <TableHead className="font-bold text-gray-900 dark:text-white text-center hidden lg:table-cell">
                          GC
                        </TableHead>
                        <TableHead className="font-bold text-gray-900 dark:text-white text-center">
                          DG
                        </TableHead>
                        <TableHead className="font-bold text-gray-900 dark:text-white text-center">
                          Pts
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {standings.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={10} className="text-center py-16">
                            <div className="space-y-4">
                              <div className="w-20 h-20 bg-gradient-to-br from-[#ad45ff]/10 to-[#c77dff]/10 rounded-2xl flex items-center justify-center mx-auto">
                                <Trophy className="w-10 h-10 text-[#ad45ff]" />
                              </div>
                              <div>
                                <p className="text-gray-900 dark:text-white font-semibold text-lg">
                                  No hay equipos registrados
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                  Agrega equipos en la pestaña Equipos para ver
                                  la tabla
                                </p>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        standings.map((row, idx) => {
                          const team = teamMap.get(row.teamId);
                          const isFirst = idx === 0;
                          const isTop3 = idx <= 2;
                          const isBottom3 = idx >= standings.length - 3;

                          const positionStyles = isFirst
                            ? "bg-gradient-to-r from-yellow-50 to-amber-50/50 dark:from-yellow-900/20 dark:to-amber-900/10"
                            : isTop3
                              ? "bg-gradient-to-r from-green-50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/10"
                              : isBottom3
                                ? "bg-gradient-to-r from-red-50 to-rose-50/50 dark:from-red-900/20 dark:to-rose-900/10"
                                : "hover:bg-gray-50/50 dark:hover:bg-gray-800/50";

                          return (
                            <TableRow
                              key={row.id}
                              className={`transition-all duration-200 border-b border-gray-100 dark:border-gray-800 ${positionStyles}`}
                            >
                              <TableCell className="font-bold text-center">
                                <div className="flex items-center justify-center">
                                  {isFirst ? (
                                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg shadow-yellow-400/30">
                                      <Trophy className="w-4 h-4 text-white" />
                                    </div>
                                  ) : isTop3 ? (
                                    <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-green-400/30">
                                      {idx + 1}
                                    </div>
                                  ) : isBottom3 ? (
                                    <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-rose-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-red-400/30">
                                      {idx + 1}
                                    </div>
                                  ) : (
                                    <span className="text-gray-600 dark:text-gray-400 font-semibold">
                                      {idx + 1}
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="relative">
                                    <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white dark:border-gray-700 shadow-md">
                                      <img
                                        src={
                                          team?.logoUrl || "/placeholder.svg"
                                        }
                                        alt={team?.name || "Equipo"}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    {isFirst && (
                                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                                        <span className="text-[8px]">👑</span>
                                      </div>
                                    )}
                                  </div>
                                  <span className="font-semibold text-gray-900 dark:text-white">
                                    {team?.name || "Equipo desconocido"}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-center font-medium text-gray-700 dark:text-gray-300 hidden sm:table-cell">
                                {row.matchesPlayed}
                              </TableCell>
                              <TableCell className="text-center font-semibold text-green-600 dark:text-green-400 hidden md:table-cell">
                                {row.wins}
                              </TableCell>
                              <TableCell className="text-center font-medium text-gray-500 dark:text-gray-400 hidden md:table-cell">
                                {row.draws}
                              </TableCell>
                              <TableCell className="text-center font-semibold text-red-600 dark:text-red-400 hidden md:table-cell">
                                {row.losses}
                              </TableCell>
                              <TableCell className="text-center font-medium text-gray-700 dark:text-gray-300 hidden lg:table-cell">
                                {row.goalsFor}
                              </TableCell>
                              <TableCell className="text-center font-medium text-gray-700 dark:text-gray-300 hidden lg:table-cell">
                                {row.goalsAgainst}
                              </TableCell>
                              <TableCell className="text-center font-semibold">
                                <span
                                  className={`inline-flex items-center justify-center w-8 h-6 rounded-md text-sm ${
                                    row.goalDifference >= 0
                                      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                      : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                                  }`}
                                >
                                  {row.goalDifference > 0 ? "+" : ""}
                                  {row.goalDifference}
                                </span>
                              </TableCell>
                              <TableCell className="text-center">
                                <span className="inline-flex items-center justify-center w-10 h-8 bg-gradient-to-r from-[#ad45ff] to-[#c77dff] text-white font-bold text-lg rounded-lg shadow-lg shadow-[#ad45ff]/25">
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
          </div>
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
