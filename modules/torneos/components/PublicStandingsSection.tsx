"use client";

import { useMemo } from "react";
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

interface PublicStandingsSectionProps {
  tournamentTeams: ITournamentTeam[];
  matches: IMatch[];
  tournamentFormat: string;
}

/**
 * Sección de posiciones para la página pública del torneo
 * Combina la tabla de posiciones con el bracket de eliminación cuando aplica
 */
export function PublicStandingsSection({
  tournamentTeams,
  matches,
  tournamentFormat,
}: Readonly<PublicStandingsSectionProps>) {
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

  // Si es formato de solo bracket (eliminación directa pura)
  if (displayType === "bracket") {
    return (
      <div className="space-y-8">
        <KnockoutBracket
          matches={matches}
          title="Llaves del Torneo"
          description="Partidos de eliminación directa"
        />
      </div>
    );
  }

  // Si es formato mixto (grupos + eliminación)
  if (displayType === "mixed" || hasKnockoutMatches) {
    return (
      <div className="space-y-8">
        {/* Tabla de posiciones (fase de grupos/liga) */}
        <StandingsTable
          tournamentTeams={tournamentTeams}
          variant="public"
          title={
            hasGroups ? "Tabla de Posiciones por Grupo" : "Tabla de Posiciones"
          }
          description={
            hasGroups
              ? "Clasificación por grupo en la fase de grupos"
              : "Clasificación actual del torneo"
          }
        />

        {/* Bracket de eliminación (si hay partidos de knockout) */}
        {hasKnockoutMatches && (
          <KnockoutBracket
            matches={matches}
            title="Fase Final"
            description="Partidos de eliminación directa"
          />
        )}
      </div>
    );
  }

  // Formato de liga/tabla simple
  return (
    <StandingsTable
      tournamentTeams={tournamentTeams}
      variant="public"
      title="Tabla de Posiciones"
      description="Clasificación actual del torneo"
    />
  );
}

export default PublicStandingsSection;
