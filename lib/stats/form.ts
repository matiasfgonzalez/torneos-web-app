import type { Outcome, StatMatch, StatTeamRef } from "./types";
import { teamOutcome } from "./match-outcome";

/** Racha actual: qué se viene repitiendo y cuántas veces seguidas. */
export interface Streak {
  type: Outcome;
  count: number;
}

export interface TeamForm {
  tournamentTeamId: string;
  teamId: string;
  teamName: string;
  teamLogoUrl: string | null;
  /** Últimos resultados, **del más viejo al más nuevo** (para leer de izq→der). */
  recent: Outcome[];
  /** Racha vigente (la corrida más reciente), o null si no jugó nada. */
  streak: Streak | null;
  played: number;
}

const DEFAULT_RECENT = 5;

/**
 * Forma reciente y racha de cada equipo (S7).
 *
 * Ordena los partidos jugados por fecha ascendente y toma la cola: la "forma"
 * es lo último que pasó, no lo primero. La racha se mide desde el partido más
 * reciente hacia atrás mientras el resultado se repita.
 *
 * Devuelve una fila **por equipo participante**, en el orden en que vinieron
 * (la UI los muestra en el orden de la tabla). Un equipo que todavía no jugó
 * aparece con `recent: []` y `streak: null` — está en el torneo aunque no tenga
 * historia.
 */
export function computeTeamForm(
  teams: StatTeamRef[],
  matches: StatMatch[],
  options: { recent?: number } = {},
): TeamForm[] {
  const recentCount = options.recent ?? DEFAULT_RECENT;

  // Orden estable por fecha: los partidos empatados en fecha conservan el orden
  // de entrada. `new Date` sobre un ISO string o un Date, ambos válidos.
  const byDate = [...matches].sort(
    (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime(),
  );

  return teams.map((team) => {
    const outcomes: Outcome[] = [];
    for (const match of byDate) {
      const o = teamOutcome(match, team.tournamentTeamId);
      if (o) outcomes.push(o);
    }

    return {
      tournamentTeamId: team.tournamentTeamId,
      teamId: team.teamId,
      teamName: team.teamName,
      teamLogoUrl: team.teamLogoUrl,
      recent: outcomes.slice(-recentCount),
      streak: currentStreak(outcomes),
      played: outcomes.length,
    };
  });
}

/** La corrida más reciente: cuenta hacia atrás desde el último resultado. */
function currentStreak(outcomes: Outcome[]): Streak | null {
  if (outcomes.length === 0) return null;
  const type = outcomes[outcomes.length - 1];
  let count = 0;
  for (let i = outcomes.length - 1; i >= 0 && outcomes[i] === type; i--) {
    count += 1;
  }
  return { type, count };
}
