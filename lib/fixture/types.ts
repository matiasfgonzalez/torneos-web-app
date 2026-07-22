import type { PhaseType } from "@prisma/client";

/**
 * Generador de fixture (S1) — tipos compartidos.
 *
 * Todo el módulo `lib/fixture/*` es **puro**: recibe ids y devuelve un plan de
 * partidos. No toca Prisma, ni `Date.now()`, ni auth. Eso lo hace el server
 * action (`modules/torneos/actions/generateFixture.ts`), que es quien valida
 * permisos y escribe. Así el algoritmo —la parte con reglas de negocio de
 * verdad— se testea sin base de datos (encaja con A8).
 */

/** Un partido planificado, todavía sin fecha. */
export interface PlannedMatch {
  /** Id de `TournamentTeam` (no de `Team`): es lo que referencia `Match`. */
  homeTeamId: string;
  awayTeamId: string;
  /** Jornada dentro de su fase. Se escribe en `Match.roundNumber`. */
  roundNumber: number;
  /** Grupo al que pertenece el cruce, si el formato usa grupos ("A", "B"…). */
  group?: string;
}

/** Una fase a crear (`TournamentPhase`) con sus partidos. */
export interface PlannedPhase {
  name: string;
  type: PhaseType;
  order: number;
  matches: PlannedMatch[];
}

/** Resultado del generador: lo que el server tiene que escribir. */
export interface FixturePlan {
  phases: PlannedPhase[];
  /**
   * Grupo asignado a cada equipo (`TournamentTeam.id` → "A"/"B"…). Solo en
   * formato de grupos; el server lo escribe en `TournamentTeam.group`.
   */
  groupAssignments?: Record<string, string>;
  /**
   * Equipos que pasan de ronda sin jugar (llaves con byes). No generan partido
   * —no hay rival— pero el organizador tiene que enterarse.
   */
  byes: string[];
  /** Resumen para el toast/diálogo: "12 partidos en 6 fechas". */
  totalMatches: number;
}

export interface FixtureOptions {
  /** Ida y vuelta: cada cruce se juega dos veces, invirtiendo la localía. */
  homeAndAway: boolean;
  /** Cantidad de grupos. Solo aplica al formato GRUPOS. */
  groupCount?: number;
  /**
   * Grupo ya asignado a cada equipo (`TournamentTeam.id` → "A"). Si viene, el
   * generador **no sortea ni reparte**: arma el todos contra todos dentro de
   * los grupos que ya están, y el plan no devuelve `groupAssignments` para que
   * el server no los pise. Para sorteos hechos por la liga (bombos, acto
   * público, o cargar a mano los grupos reales de un torneo existente).
   */
  existingGroups?: Readonly<Record<string, string>>;
  /** Semilla para el sorteo. Misma semilla = mismo fixture (tests estables). */
  seed?: number;
}
