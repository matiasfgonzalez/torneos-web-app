"use client";

import { useMemo } from "react";
import {
  ITournamentTeam,
  IMatch,
} from "@modules/torneos/types/tournament-teams.types";
import {
  StandingsTable,
  type FormResult,
} from "@modules/torneos/components/StandingsTable";
import { KnockoutSection } from "@modules/torneos/components/KnockoutSection";
import {
  hasMultipleGroups,
  getTournamentDisplayType,
  isKnockoutPhaseType,
} from "@/lib/standings/phase-utils";

/** Cuántos resultados recientes componen la "racha" de la tabla (F2) */
const FORM_LENGTH = 5;

/**
 * Racha por TournamentTeam.id a partir de los partidos ya computables
 * (FINALIZADO y WALKOVER — los mismos que suman a la tabla): últimos
 * FORM_LENGTH resultados, del más viejo al más reciente.
 */
function computeForm(matches: IMatch[]): Record<string, FormResult[]> {
  const form: Record<string, FormResult[]> = {};

  const played = matches
    .filter(
      (m) =>
        (m.status === "FINALIZADO" || m.status === "WALKOVER") &&
        m.homeScore != null &&
        m.awayScore != null,
    )
    .sort(
      (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime(),
    );

  for (const m of played) {
    const home = m.homeScore ?? 0;
    const away = m.awayScore ?? 0;
    const homeResult: FormResult = home > away ? "W" : home < away ? "L" : "D";
    const awayResult: FormResult = home > away ? "L" : home < away ? "W" : "D";
    (form[m.homeTeamId] ??= []).push(homeResult);
    (form[m.awayTeamId] ??= []).push(awayResult);
  }

  for (const teamId of Object.keys(form)) {
    form[teamId] = form[teamId].slice(-FORM_LENGTH);
  }
  return form;
}

interface PublicStandingsSectionProps {
  tournamentTeams: ITournamentTeam[];
  matches: IMatch[];
  tournamentFormat: string;
  /** Orden de desempate del torneo (N7) */
  tiebreakers?: unknown;
}

/**
 * Sección de posiciones para la página pública del torneo
 * Combina la tabla de posiciones con el bracket de eliminación cuando aplica
 */
export function PublicStandingsSection({
  tournamentTeams,
  matches,
  tournamentFormat,
  tiebreakers,
}: Readonly<PublicStandingsSectionProps>) {
  const displayType = useMemo(
    () => getTournamentDisplayType(tournamentFormat),
    [tournamentFormat],
  );

  const hasKnockoutMatches = useMemo(
    () => matches.some((m) => isKnockoutPhaseType(m.tournamentPhase?.type)),
    [matches],
  );

  const hasGroups = useMemo(
    () => hasMultipleGroups(tournamentTeams),
    [tournamentTeams],
  );

  // Racha de cada equipo (F2) — se muestra como columna en la tabla
  const formByTeamId = useMemo(() => computeForm(matches), [matches]);

  // Si es formato de solo bracket (eliminación directa pura)
  if (displayType === "bracket") {
    return (
      <div className="space-y-8">
        <KnockoutSection
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
          tiebreakers={tiebreakers}
          formByTeamId={formByTeamId}
          title={
            hasGroups ? "Tabla de Posiciones por Grupo" : "Tabla de Posiciones"
          }
          description={
            hasGroups
              ? "Clasificación por grupo en la fase de grupos"
              : "Clasificación actual del torneo"
          }
        />

        {/* Fase final: cuadro (por defecto) + listado (S13c) */}
        {hasKnockoutMatches && (
          <KnockoutSection
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
      tiebreakers={tiebreakers}
      formByTeamId={formByTeamId}
      title="Tabla de Posiciones"
      description="Clasificación actual del torneo"
    />
  );
}

export default PublicStandingsSection;
