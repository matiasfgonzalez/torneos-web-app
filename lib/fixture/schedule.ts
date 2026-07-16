import type { PlannedMatch } from "./types";

export interface ScheduleOptions {
  /** Día y hora de la primera jornada. */
  startDate: Date;
  /** Días entre jornada y jornada. 7 = una fecha por semana. */
  intervalDays: number;
}

/**
 * Le pone fecha a cada partido del plan (S1).
 *
 * Todos los partidos de una misma jornada caen el mismo día y hora: es como se
 * programa un torneo amateur de verdad (una fecha por fin de semana), y deja el
 * calendario listo para retocar de a uno con el formulario de partido.
 *
 * Se usa aritmética de fecha **local** (`setDate`), no sumar milisegundos: con
 * milisegundos, cruzar un cambio de horario de verano corre la hora de todas
 * las jornadas posteriores.
 */
export function scheduleMatches(
  matches: readonly PlannedMatch[],
  { startDate, intervalDays }: ScheduleOptions,
): { match: PlannedMatch; dateTime: Date }[] {
  return matches.map((match) => {
    const dateTime = new Date(startDate);
    dateTime.setDate(dateTime.getDate() + (match.roundNumber - 1) * intervalDays);
    return { match, dateTime };
  });
}
