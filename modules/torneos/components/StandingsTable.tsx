"use client";

import { useMemo, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Users, Layers } from "lucide-react";
import { ITournamentTeam } from "@modules/torneos/types/tournament-teams.types";
import {
  groupTeamsByGroup,
  hasMultipleGroups,
  getPhaseTypeName,
} from "@/lib/standings/phase-utils";

interface TeamStandingRow {
  id: string;
  teamId: string;
  teamName: string;
  teamLogo: string;
  group?: string | null;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

interface PhaseInfo {
  id: string;
  name: string;
  type?: string;
}

interface StandingsTableProps {
  tournamentTeams: ITournamentTeam[];
  className?: string;
  showGroupFilter?: boolean;
  showPhaseFilter?: boolean;
  variant?: "public" | "admin";
  title?: string;
  description?: string;
}

/**
 * Componente de tabla de posiciones que soporta:
 * - Visualización por grupos
 * - Filtrado por fase
 * - Estadísticas acumuladas o por fase
 */
export function StandingsTable({
  tournamentTeams,
  className = "",
  showGroupFilter = true,
  showPhaseFilter = true,
  variant = "public",
  title = "Tabla de Posiciones",
  description = "Clasificación actual del torneo",
}: Readonly<StandingsTableProps>) {
  const [selectedPhase, setSelectedPhase] = useState<string>("all");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");

  // Derivar grupos disponibles
  const availableGroups = useMemo(() => {
    const groups = new Set<string>();
    tournamentTeams.forEach((team) => {
      if (team.group) groups.add(team.group);
    });
    return Array.from(groups).sort((a, b) => a.localeCompare(b));
  }, [tournamentTeams]);

  // Derivar fases disponibles
  const availablePhases = useMemo(() => {
    const phases = new Map<string, PhaseInfo>();
    tournamentTeams.forEach((team) => {
      team.phaseStats?.forEach((stat) => {
        const phaseName =
          (stat as any).tournamentPhase?.name || "Fase desconocida";
        const phaseType = (stat as any).tournamentPhase?.type;
        if (!phases.has(stat.tournamentPhaseId)) {
          phases.set(stat.tournamentPhaseId, {
            id: stat.tournamentPhaseId,
            name: phaseName,
            type: phaseType,
          });
        }
      });
    });
    return Array.from(phases.values());
  }, [tournamentTeams]);

  // Verificar si hay múltiples grupos
  const multipleGroups = useMemo(
    () => hasMultipleGroups(tournamentTeams),
    [tournamentTeams],
  );

  // Calcular standings basado en fase y grupo seleccionados
  const standings = useMemo((): TeamStandingRow[] => {
    let data = tournamentTeams.map((team): TeamStandingRow => {
      let stats = {
        matchesPlayed: team.matchesPlayed,
        wins: team.wins,
        draws: team.draws,
        losses: team.losses,
        goalsFor: team.goalsFor,
        goalsAgainst: team.goalsAgainst,
        goalDifference: team.goalDifference,
        points: team.points,
      };

      // Si hay una fase seleccionada, usar las stats de esa fase
      if (selectedPhase !== "all") {
        const phaseStat = team.phaseStats?.find(
          (s) => s.tournamentPhaseId === selectedPhase,
        );
        if (phaseStat) {
          stats = {
            matchesPlayed: phaseStat.matchesPlayed,
            wins: phaseStat.wins,
            draws: phaseStat.draws,
            losses: phaseStat.losses,
            goalsFor: phaseStat.goalsFor,
            goalsAgainst: phaseStat.goalsAgainst,
            goalDifference: phaseStat.goalDifference,
            points: phaseStat.points,
          };
        } else {
          // Si no tiene stats en esta fase, todo en 0
          stats = {
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
      }

      return {
        id: team.id,
        teamId: team.teamId,
        teamName: team.team?.name || "Equipo desconocido",
        teamLogo: team.team?.logoUrl || "/placeholder.svg",
        group: team.group,
        ...stats,
      };
    });

    // Filtrar por grupo si está seleccionado
    if (selectedGroup !== "all") {
      data = data.filter((team) => team.group === selectedGroup);
    }

    // Ordenar
    return data.sort((a, b) => {
      if (a.points !== b.points) return b.points - a.points;
      if (a.goalDifference !== b.goalDifference)
        return b.goalDifference - a.goalDifference;
      if (a.wins !== b.wins) return b.wins - a.wins;
      return b.goalsFor - a.goalsFor;
    });
  }, [tournamentTeams, selectedPhase, selectedGroup]);

  // Agrupar standings por grupo para visualización separada
  const standingsByGroup = useMemo(() => {
    if (!multipleGroups || selectedGroup !== "all") return null;
    return groupTeamsByGroup(standings);
  }, [standings, multipleGroups, selectedGroup]);

  // Componente de tabla reutilizable
  const renderTable = (rows: TeamStandingRow[], showGroupColumn = false) => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800">
            <TableHead className="w-12 text-center font-semibold text-gray-700 dark:text-gray-300">
              Pos
            </TableHead>
            <TableHead className="font-semibold text-gray-700 dark:text-gray-300">
              Equipo
            </TableHead>
            {showGroupColumn && (
              <TableHead className="text-center font-semibold text-gray-700 dark:text-gray-300 hidden sm:table-cell">
                Grupo
              </TableHead>
            )}
            <TableHead className="text-center font-semibold text-gray-700 dark:text-gray-300">
              PJ
            </TableHead>
            <TableHead className="text-center hidden md:table-cell font-semibold text-gray-700 dark:text-gray-300">
              G
            </TableHead>
            <TableHead className="text-center hidden md:table-cell font-semibold text-gray-700 dark:text-gray-300">
              E
            </TableHead>
            <TableHead className="text-center hidden md:table-cell font-semibold text-gray-700 dark:text-gray-300">
              P
            </TableHead>
            <TableHead className="text-center hidden md:table-cell font-semibold text-gray-700 dark:text-gray-300">
              GF
            </TableHead>
            <TableHead className="text-center hidden md:table-cell font-semibold text-gray-700 dark:text-gray-300">
              GC
            </TableHead>
            <TableHead className="text-center font-semibold text-gray-700 dark:text-gray-300">
              DG
            </TableHead>
            <TableHead className="text-center font-semibold text-gray-700 dark:text-gray-300">
              Pts
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={showGroupColumn ? 11 : 10}
                className="text-center py-12"
              >
                <div className="space-y-3">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#ad45ff]/10 to-[#c77dff]/10 rounded-2xl flex items-center justify-center mx-auto">
                    <Trophy className="w-8 h-8 text-[#ad45ff]" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">
                    No hay equipos en esta selección
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, index) => (
              <TableRow
                key={row.id}
                className="group hover:bg-[#ad45ff]/5 dark:hover:bg-[#ad45ff]/10 transition-colors duration-200 border-b border-gray-100 dark:border-gray-800"
              >
                <TableCell className="font-medium text-center py-4">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shadow-md transition-transform group-hover:scale-110 ${
                      index === 0
                        ? "bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-yellow-500/30"
                        : index === 1
                          ? "bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800 shadow-gray-400/30"
                          : index === 2
                            ? "bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow-amber-600/30"
                            : index <= 4
                              ? "bg-gradient-to-br from-green-400 to-green-600 text-white shadow-green-500/30"
                              : index <= 6
                                ? "bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-blue-500/30"
                                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {index + 1}
                  </div>
                </TableCell>
                <TableCell className="font-medium py-4">
                  <div className="flex items-center gap-4">
                    <div className="relative w-10 h-10 md:w-12 md:h-12 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 p-0.5 group-hover:shadow-lg transition-shadow">
                      <img
                        src={row.teamLogo}
                        alt={`Escudo de ${row.teamName}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <span className="truncate hidden sm:block text-gray-900 dark:text-white font-semibold group-hover:text-[#ad45ff] transition-colors">
                      {row.teamName}
                    </span>
                  </div>
                </TableCell>
                {showGroupColumn && (
                  <TableCell className="text-center hidden sm:table-cell">
                    <Badge
                      variant="secondary"
                      className="bg-[#ad45ff]/10 text-[#ad45ff] border-0"
                    >
                      {row.group || "-"}
                    </Badge>
                  </TableCell>
                )}
                <TableCell className="text-center text-gray-700 dark:text-gray-300 font-medium">
                  {row.matchesPlayed}
                </TableCell>
                <TableCell className="text-center hidden md:table-cell text-green-600 dark:text-green-400 font-medium">
                  {row.wins}
                </TableCell>
                <TableCell className="text-center hidden md:table-cell text-gray-500 dark:text-gray-400 font-medium">
                  {row.draws}
                </TableCell>
                <TableCell className="text-center hidden md:table-cell text-red-500 dark:text-red-400 font-medium">
                  {row.losses}
                </TableCell>
                <TableCell className="text-center hidden md:table-cell text-gray-700 dark:text-gray-300 font-medium">
                  {row.goalsFor}
                </TableCell>
                <TableCell className="text-center hidden md:table-cell text-gray-700 dark:text-gray-300 font-medium">
                  {row.goalsAgainst}
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant="secondary"
                    className={`font-bold ${
                      row.goalDifference > 0
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : row.goalDifference < 0
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                    }`}
                  >
                    {row.goalDifference > 0 ? "+" : ""}
                    {row.goalDifference}
                  </Badge>
                </TableCell>
                <TableCell className="text-center py-4">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#ad45ff] to-[#c77dff] text-white font-bold shadow-lg shadow-[#ad45ff]/25">
                    {row.points}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <Card
      className={`relative bg-white dark:bg-gray-900/80 shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden rounded-2xl backdrop-blur-sm ${className}`}
    >
      {/* Gradient accent bar */}
      <div className="h-1.5 bg-gradient-to-r from-[#ad45ff] via-[#c77dff] to-[#a3b3ff]" />

      <CardHeader className="border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800/50">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-[#ad45ff] to-[#c77dff] rounded-xl shadow-lg shadow-[#ad45ff]/25">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-gray-900 dark:text-white text-xl">
                {title}
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                {description}
              </CardDescription>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Filtro de fase */}
            {showPhaseFilter && availablePhases.length > 0 && (
              <div className="w-full sm:w-48">
                <Select value={selectedPhase} onValueChange={setSelectedPhase}>
                  <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#ad45ff]" />
                      <SelectValue placeholder="Fase" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <SelectItem value="all">Tabla General</SelectItem>
                    {availablePhases.map((phase) => (
                      <SelectItem key={phase.id} value={phase.id}>
                        {phase.name}
                        {phase.type && (
                          <span className="text-xs text-gray-500 ml-1">
                            ({getPhaseTypeName(phase.type)})
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Filtro de grupo */}
            {showGroupFilter && multipleGroups && (
              <div className="w-full sm:w-40">
                <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                  <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#ad45ff]" />
                      <SelectValue placeholder="Grupo" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <SelectItem value="all">Todos los grupos</SelectItem>
                    {availableGroups.map((group) => (
                      <SelectItem key={group} value={group}>
                        Grupo {group}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Si hay múltiples grupos y no hay filtro de grupo seleccionado, mostrar por grupos */}
        {multipleGroups && selectedGroup === "all" && standingsByGroup ? (
          <Tabs defaultValue={availableGroups[0] || "all"} className="w-full">
            <div className="px-4 pt-4 border-b border-gray-100 dark:border-gray-800">
              <TabsList className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl h-auto flex flex-wrap gap-1">
                {availableGroups.map((group) => (
                  <TabsTrigger
                    key={group}
                    value={group}
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-lg px-4 py-2 text-sm font-medium transition-all"
                  >
                    Grupo {group}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            {availableGroups.map((group) => (
              <TabsContent key={group} value={group} className="mt-0">
                {renderTable(standingsByGroup.get(group) || [])}
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          // Tabla única sin tabs de grupos
          renderTable(standings, multipleGroups && selectedGroup === "all")
        )}
      </CardContent>
    </Card>
  );
}

export default StandingsTable;
