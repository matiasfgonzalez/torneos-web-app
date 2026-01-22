/**
 * Utilidades para determinar tipos de fases y si suman puntos
 */

/**
 * Tipos de fase del modelo TournamentPhase
 * - GROUP: Fase de grupos (suma puntos)
 * - LEAGUE: Liga/todos contra todos (suma puntos)
 * - KNOCKOUT: Eliminación directa (NO suma puntos)
 */
export type PhaseType = "GROUP" | "LEAGUE" | "KNOCKOUT";

/**
 * Nombres de fases del modelo Phase (legacy)
 */
export type LegacyPhaseName =
  | "FECHA"
  | "CRUCES"
  | "FASES_DE_GRUPOS"
  | "DIECISAVOS_DE_FINAL"
  | "OCTAVOS_DE_FINAL"
  | "CUARTOS_DE_FINAL"
  | "SEMIFINAL"
  | "FINAL";

/**
 * Fases de eliminación directa (knockout) que NO suman puntos
 */
const KNOCKOUT_PHASES: Set<LegacyPhaseName> = new Set([
  "CRUCES",
  "DIECISAVOS_DE_FINAL",
  "OCTAVOS_DE_FINAL",
  "CUARTOS_DE_FINAL",
  "SEMIFINAL",
  "FINAL",
]);

/**
 * Fases que SÍ suman puntos a la tabla de posiciones
 */
const POINT_COUNTING_PHASES: Set<LegacyPhaseName> = new Set([
  "FECHA",
  "FASES_DE_GRUPOS",
]);

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
 * Determina si una fase legacy suma puntos
 */
export function legacyPhaseCountsPoints(
  phaseName: string | undefined | null,
): boolean {
  if (!phaseName) return true; // Por defecto suma puntos si no hay fase
  return POINT_COUNTING_PHASES.has(phaseName as LegacyPhaseName);
}

/**
 * Determina si una fase legacy es de eliminación directa
 */
export function isKnockoutPhase(phaseName: string | undefined | null): boolean {
  if (!phaseName) return false;
  return KNOCKOUT_PHASES.has(phaseName as LegacyPhaseName);
}

/**
 * Obtiene el nombre legible de una fase legacy
 */
export function getLegacyPhaseName(phaseName: string): string {
  const names: Record<string, string> = {
    FECHA: "Fecha",
    CRUCES: "Cruces",
    FASES_DE_GRUPOS: "Fase de Grupos",
    DIECISAVOS_DE_FINAL: "Dieciseisavos de Final",
    OCTAVOS_DE_FINAL: "Octavos de Final",
    CUARTOS_DE_FINAL: "Cuartos de Final",
    SEMIFINAL: "Semifinal",
    FINAL: "Final",
  };
  return names[phaseName] || phaseName;
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
 * Ordena las fases de eliminación directa por orden lógico
 */
export function getKnockoutPhaseOrder(phaseName: string): number {
  const order: Record<string, number> = {
    CRUCES: 0,
    DIECISAVOS_DE_FINAL: 1,
    OCTAVOS_DE_FINAL: 2,
    CUARTOS_DE_FINAL: 3,
    SEMIFINAL: 4,
    FINAL: 5,
  };
  return order[phaseName] ?? 99;
}

/**
 * Determina el tipo de visualización recomendado para un torneo
 * basado en su formato
 */
export function getTournamentDisplayType(
  format: string,
): "table" | "bracket" | "mixed" {
  const upperFormat = format.toUpperCase();

  // Formatos que solo muestran tabla
  if (["LIGA", "ROUND_ROBIN", "TODOS_CONTRA_TODOS"].includes(upperFormat)) {
    return "table";
  }

  // Formatos que solo muestran bracket
  if (["ELIMINACION_DIRECTA", "COPA", "PLAYOFFS"].includes(upperFormat)) {
    return "bracket";
  }

  // Formatos mixtos
  if (
    ["GRUPOS", "MIXTO", "LIGUILLA", "DOBLE_ELIMINACION"].includes(upperFormat)
  ) {
    return "mixed";
  }

  return "table"; // Por defecto
}

/**
 * Agrupa equipos por su grupo asignado
 */
export function groupTeamsByGroup<T extends { group?: string | null }>(
  teams: T[],
): Map<string, T[]> {
  const groups = new Map<string, T[]>();

  teams.forEach((team) => {
    const groupName = team.group || "Sin Grupo";
    const groupTeams = groups.get(groupName) || [];
    groupTeams.push(team);
    groups.set(groupName, groupTeams);
  });

  // Ordenar cada grupo internamente (asumiendo que tienen stats)
  groups.forEach((groupTeams, groupName) => {
    const sortedTeams = [...groupTeams].sort((a: any, b: any) => {
      if (a.points !== b.points) return (b.points || 0) - (a.points || 0);
      if (a.goalDifference !== b.goalDifference)
        return (b.goalDifference || 0) - (a.goalDifference || 0);
      return (b.goalsFor || 0) - (a.goalsFor || 0);
    });
    groups.set(groupName, sortedTeams);
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
