"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Layers, Swords } from "lucide-react";
import {
  ITournamentTeam,
  IMatch,
} from "@modules/torneos/types/tournament-teams.types";
import { StandingsTable } from "@modules/torneos/components/StandingsTable";
import { KnockoutBracket } from "@modules/torneos/components/KnockoutBracket";
import {
  hasMultipleGroups,
  getTournamentDisplayType,
  isKnockoutPhase,
} from "@/lib/standings/phase-utils";

interface AdminStandingsSectionProps {
  tournamentTeams: ITournamentTeam[];
  matches: IMatch[];
  tournamentFormat: string;
}

interface PhaseInfo {
  id: string;
  name: string;
  type?: string;
}

/**
 * Sección de posiciones para la página de administración del torneo
 * Incluye filtros adicionales y visualización por grupos/fases
 */
export function AdminStandingsSection({
  tournamentTeams,
  matches,
  tournamentFormat,
}: Readonly<AdminStandingsSectionProps>) {
  const [viewMode, setViewMode] = useState<"table" | "bracket" | "all">("all");

  const displayType = useMemo(
    () => getTournamentDisplayType(tournamentFormat),
    [tournamentFormat],
  );

  const hasKnockoutMatches = useMemo(
    () => matches.some((m) => isKnockoutPhase(m.phase?.name)),
    [matches],
  );

  const hasGroups = useMemo(
    () => hasMultipleGroups(tournamentTeams),
    [tournamentTeams],
  );

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

  const showViewModeSelector =
    (displayType === "mixed" || hasKnockoutMatches) &&
    tournamentTeams.length > 0;

  return (
    <div className="space-y-6">
      {/* Encabezado con selector de vista */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-[#ad45ff] to-[#c77dff] rounded-xl shadow-lg shadow-[#ad45ff]/25">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Tabla de Posiciones
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {hasGroups ? "Por grupos" : "General"}
              {availablePhases.length > 0 &&
                ` • ${availablePhases.length} fase(s)`}
              {hasKnockoutMatches && " • Con llaves"}
            </p>
          </div>
        </div>

        {showViewModeSelector && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Ver:
            </span>
            <Tabs
              value={viewMode}
              onValueChange={(v) =>
                setViewMode(v as "table" | "bracket" | "all")
              }
            >
              <TabsList className="bg-gray-100 dark:bg-gray-800">
                <TabsTrigger value="all" className="text-xs">
                  Todo
                </TabsTrigger>
                <TabsTrigger value="table" className="text-xs">
                  <Trophy className="w-3 h-3 mr-1" />
                  Tabla
                </TabsTrigger>
                <TabsTrigger value="bracket" className="text-xs">
                  <Swords className="w-3 h-3 mr-1" />
                  Llaves
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        )}
      </div>

      {/* Contenido según modo de visualización */}
      <div className="space-y-8">
        {/* Tabla de posiciones */}
        {(viewMode === "all" || viewMode === "table") &&
          tournamentTeams.length > 0 && (
            <StandingsTable
              tournamentTeams={tournamentTeams}
              variant="admin"
              title={
                hasGroups ? "Clasificación por Grupo" : "Clasificación General"
              }
              description={
                hasGroups
                  ? "Posiciones separadas por grupo en la fase de grupos"
                  : "Ordenada por puntos, diferencia de gol y goles a favor"
              }
            />
          )}

        {/* Bracket de eliminación */}
        {(viewMode === "all" || viewMode === "bracket") &&
          hasKnockoutMatches && (
            <KnockoutBracket
              matches={matches}
              title="Fase de Eliminación"
              description="Partidos de eliminación directa (no suman puntos)"
            />
          )}

        {/* Estado vacío */}
        {tournamentTeams.length === 0 && (
          <Card className="relative bg-white dark:bg-gray-900 border-0 shadow-2xl rounded-2xl overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-[#ad45ff] via-[#c77dff] to-[#a3b3ff]" />
            <CardContent className="py-16">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-gradient-to-br from-[#ad45ff]/10 to-[#c77dff]/10 rounded-2xl flex items-center justify-center mx-auto">
                  <Trophy className="w-10 h-10 text-[#ad45ff]" />
                </div>
                <div>
                  <p className="text-gray-900 dark:text-white font-semibold text-lg">
                    No hay equipos registrados
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Agrega equipos en la pestaña Equipos para ver la tabla de
                    posiciones
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Información sobre tipos de fase */}
      {availablePhases.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Layers className="w-4 h-4 text-[#ad45ff]" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Fases del torneo
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {availablePhases.map((phase) => (
              <div
                key={phase.id}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-sm"
              >
                <span className="text-gray-900 dark:text-white font-medium">
                  {phase.name}
                </span>
                {phase.type && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      phase.type.toUpperCase() === "KNOCKOUT"
                        ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                        : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    }`}
                  >
                    {phase.type.toUpperCase() === "KNOCKOUT"
                      ? "No suma pts"
                      : "Suma pts"}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminStandingsSection;
