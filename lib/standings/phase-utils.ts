/**
 * Utilidades para determinar tipos de fases y si suman puntos
 */

import { makeStandingsComparator } from "./config";

/**
 * Tipos de fase del modelo TournamentPhase
 * - GROUP: Fase de grupos (suma puntos)
 * - LEAGUE: Liga/todos contra todos (suma puntos)
 * - KNOCKOUT: Eliminación directa (NO suma puntos)
 */
export type PhaseType = "GROUP" | "LEAGUE" | "KNOCKOUT";

/**
 * Determina si un tipo de fase de TournamentPhase suma puntos
 */
export function phaseTypeCountsPoints(
  type: string | undefined | null,
): boolean {
  if (!type) return true; // Por defecto suma puntos si no hay tipo
  const upperType = type.toUpperCase();
  return upperType === "GROUP" || upperType === "LEAGUE";
}

/**
 * ¿La fase de este partido es de eliminación directa? (S1)
 *
 * Filtra por **`type`**, no por nombre. La versión anterior comparaba
 * `match.phase?.name` contra una lista fija de nombres (`OCTAVOS_DE_FINAL`,
 * `CRUCES`…) del modelo `Phase` **legacy, borrado en A6**: el campo ya no lo
 * trae ninguna query, así que devolvía `false` siempre y el bracket, los badges
 * de fase y la detección de llaves quedaron muertos sin que nadie lo notara.
 * `TournamentPhase.name` es texto libre y no se puede comparar contra una lista.
 */
export function isKnockoutPhaseType(
  type: string | undefined | null,
): boolean {
  return type?.toUpperCase() === "KNOCKOUT";
}

/**
 * ¿Esta fase es la que define el título? Se usa solo para destacarla en el
 * bracket. Por nombre a propósito: `TournamentPhase` no marca cuál es la final,
 * y el generador (S1) la nombra exactamente "Final".
 */
export function isFinalPhase(name: string | undefined | null): boolean {
  return name?.trim().toLowerCase() === "final";
}

/**
 * Obtiene el nombre legible de un tipo de fase
 */
export function getPhaseTypeName(type: string): string {
  const names: Record<string, string> = {
    GROUP: "Fase de Grupos",
    LEAGUE: "Liga",
    KNOCKOUT: "Eliminación Directa",
  };
  return names[type.toUpperCase()] || type;
}

/**
 * Qué vista corresponde a un torneo según su formato.
 *
 * Desde M13 hay una fila por formato: el enum tiene 3 valores y son exactamente
 * las 3 vistas. Antes había 14 valores mapeados a mano contra listas de strings
 * —y los que no figuraban en ninguna caían al `table` por defecto sin que nadie
 * lo decidiera—.
 *
 * Sigue tomando `string` (no `TournamentFormat`) a propósito: las vistas
 * reciben el formato desde `ITorneo`, que lo tipa como string al cruzar el
 * límite RSC. Un valor desconocido cae a `table`.
 */
export function getTournamentDisplayType(
  format: string,
): "table" | "bracket" | "mixed" {
  switch (format?.toUpperCase()) {
    case "LIGA":
      return "table";
    case "ELIMINACION_DIRECTA":
      return "bracket";
    // Grupos + fase final: tabla por zona y, cuando existan, las llaves.
    case "GRUPOS":
      return "mixed";
    default:
      return "table";
  }
}

/**
 * Agrupa equipos por su grupo asignado
 */
export function groupTeamsByGroup<
  T extends {
    group?: string | null;
    points: number;
    goalDifference: number;
    goalsFor: number;
    goalsAgainst: number;
    wins: number;
  },
>(teams: T[], tiebreakers?: unknown): Map<string, T[]> {
  const groups = new Map<string, T[]>();

  teams.forEach((team) => {
    const groupName = team.group || "Sin Grupo";
    const groupTeams = groups.get(groupName) || [];
    groupTeams.push(team);
    groups.set(groupName, groupTeams);
  });

  // Ordenar cada grupo con los criterios de desempate del torneo (N7)
  const comparator = makeStandingsComparator<T>(tiebreakers);
  groups.forEach((groupTeams, groupName) => {
    groups.set(groupName, [...groupTeams].sort(comparator));
  });

  return groups;
}

/**
 * Verifica si un torneo tiene equipos en múltiples grupos
 */
export function hasMultipleGroups<T extends { group?: string | null }>(
  teams: T[],
): boolean {
  const groups = new Set(teams.map((t) => t.group).filter(Boolean));
  return groups.size > 1;
}
