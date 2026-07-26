import type { MatchStatus, TournamentStatus } from "@prisma/client";

import type { RuleResult } from "@/lib/match-rules";
import { MATCH_STATUS_LABELS, TOURNAMENT_STATUS_LABELS } from "@/lib/constants";

/**
 * Máquina de estados de torneo y partido (M12) — pura y testeable.
 *
 * Antes cualquier estado podía saltar a cualquier otro: un torneo FINALIZADO
 * volvía a INSCRIPCION, un partido CANCELADO pasaba a ENTRETIEMPO. Nada lo
 * impedía porque el enum de Prisma solo acota los **valores**, no el **camino**.
 *
 * Acá viven los caminos válidos, una sola vez, para que el server los **aplique**
 * y la UI los **muestre** (opciones inválidas deshabilitadas en los selects) sin
 * que las dos listas se desincronicen.
 *
 * Dos criterios que explican el grafo:
 * - **Volver atrás se permite donde el organizador se puede equivocar.** Cargar
 *   un resultado en el partido equivocado o cerrar un torneo de más pasa
 *   seguido; que el único arreglo sea tocar la base no es una regla, es una
 *   trampa. Por eso FINALIZADO reabre y CANCELADO se revierte.
 * - **Lo que se prohíbe es lo que deja datos incoherentes o miente**: saltar a
 *   ENTRETIEMPO un partido que nunca arrancó, o devolver a INSCRIPCION un torneo
 *   ya jugado (con partidos y tabla cargados).
 *
 * No cubre *permisos* (quién puede) ni *efectos* (recalcular la tabla): eso es de
 * `orgAuth`/`planLimits` y de las rutas. Acá solo el camino.
 */

// ---------------------------------------------------------------- Torneo

/**
 * Transiciones válidas de un torneo. La clave es el estado actual; el array,
 * los estados a los que puede pasar.
 *
 * - `BORRADOR` se arma en privado: abre inscripción, o queda listo para arrancar.
 * - `INSCRIPCION`/`PENDIENTE` son intercambiables (se puede reabrir la
 *   inscripción si faltó un equipo) y las dos arrancan el torneo.
 * - `ACTIVO` solo se pausa, se termina o se cancela: no vuelve a la previa
 *   porque ya hay partidos jugados.
 * - `FINALIZADO` **reabre a ACTIVO** a propósito: es como se agregan partidos
 *   que faltaban (ver `canCreateMatchInTournament` en match-rules).
 * - `ARCHIVADO` no es terminal: desarchivar es volver a FINALIZADO, o reabrir
 *   directo a ACTIVO. Ojo: reactivar consume cupo del plan — eso lo chequea la
 *   ruta, no esta tabla.
 */
export const TOURNAMENT_TRANSITIONS: Record<
  TournamentStatus,
  readonly TournamentStatus[]
> = {
  BORRADOR: ["INSCRIPCION", "PENDIENTE", "CANCELADO"],
  INSCRIPCION: ["BORRADOR", "PENDIENTE", "ACTIVO", "SUSPENDIDO", "CANCELADO"],
  PENDIENTE: ["BORRADOR", "INSCRIPCION", "ACTIVO", "SUSPENDIDO", "CANCELADO"],
  ACTIVO: ["SUSPENDIDO", "FINALIZADO", "CANCELADO"],
  SUSPENDIDO: ["ACTIVO", "PENDIENTE", "FINALIZADO", "CANCELADO"],
  FINALIZADO: ["ACTIVO", "ARCHIVADO"],
  CANCELADO: ["BORRADOR", "ARCHIVADO"],
  ARCHIVADO: ["FINALIZADO", "ACTIVO"],
};

// ---------------------------------------------------------------- Partido

/**
 * Transiciones válidas de un partido.
 *
 * - `PROGRAMADO` puede ir directo a `FINALIZADO`: el caso normal es cargar el
 *   resultado el lunes, sin haber pasado por EN_JUEGO. Bloquearlo rompería la
 *   carga rápida, que es como se usa la app de verdad.
 * - `ENTRETIEMPO` solo se alcanza desde un partido en juego — es lo que evita
 *   los estados "en vivo" inventados sobre un partido que nunca arrancó.
 * - `FINALIZADO` vuelve a `PROGRAMADO` (se cargó en el partido equivocado), a
 *   `EN_JUEGO` (se cerró antes de tiempo) o a `WALKOVER` (era ausencia y se
 *   cargó como resultado normal) — las tres son correcciones que pasan seguido.
 * - `CANCELADO` se revierte a `PROGRAMADO`: cancelar por error es común.
 */
export const MATCH_TRANSITIONS: Record<MatchStatus, readonly MatchStatus[]> = {
  PROGRAMADO: [
    "EN_JUEGO",
    "FINALIZADO",
    "WALKOVER",
    "SUSPENDIDO",
    "POSTERGADO",
    "CANCELADO",
  ],
  EN_JUEGO: ["ENTRETIEMPO", "FINALIZADO", "SUSPENDIDO"],
  ENTRETIEMPO: ["EN_JUEGO", "FINALIZADO", "SUSPENDIDO"],
  FINALIZADO: ["PROGRAMADO", "EN_JUEGO", "WALKOVER"],
  SUSPENDIDO: [
    "PROGRAMADO",
    "EN_JUEGO",
    "POSTERGADO",
    "FINALIZADO",
    "WALKOVER",
    "CANCELADO",
  ],
  POSTERGADO: ["PROGRAMADO", "SUSPENDIDO", "WALKOVER", "CANCELADO"],
  CANCELADO: ["PROGRAMADO"],
  WALKOVER: ["PROGRAMADO", "FINALIZADO"],
};

// ---------------------------------------------------------------- API común

/**
 * Estados a los que se puede pasar desde `from`, **sin incluirlo a sí mismo**
 * (quedarse donde está no es una transición). Para armar los selects.
 */
export function allowedTournamentTransitions(
  from: TournamentStatus,
): readonly TournamentStatus[] {
  return TOURNAMENT_TRANSITIONS[from] ?? [];
}

/** Ídem para partidos. */
export function allowedMatchTransitions(
  from: MatchStatus,
): readonly MatchStatus[] {
  return MATCH_TRANSITIONS[from] ?? [];
}

/**
 * Mensaje de error de una transición inválida, con los nombres en español y las
 * salidas que sí existen — el organizador tiene que saber qué SÍ puede hacer,
 * no solo que se equivocó.
 */
function transitionError(
  fromLabel: string,
  toLabel: string,
  allowedLabels: string[],
): string {
  if (allowedLabels.length === 0) {
    return `No se puede pasar de «${fromLabel}» a «${toLabel}»: «${fromLabel}» es un estado sin salida.`;
  }
  return `No se puede pasar de «${fromLabel}» a «${toLabel}». Desde «${fromLabel}» solo se puede ir a: ${allowedLabels.join(", ")}.`;
}

/**
 * ¿Es válido el cambio de estado de un torneo?
 *
 * Repetir el estado actual es válido: los PATCH parciales reenvían el `status`
 * sin querer cambiarlo, y eso no es una transición.
 */
export function canTransitionTournament(
  from: TournamentStatus,
  to: TournamentStatus,
): RuleResult {
  if (from === to) return { ok: true };

  const allowed = allowedTournamentTransitions(from);
  if (allowed.includes(to)) return { ok: true };

  return {
    ok: false,
    error: transitionError(
      TOURNAMENT_STATUS_LABELS[from] ?? from,
      TOURNAMENT_STATUS_LABELS[to] ?? to,
      allowed.map((s) => TOURNAMENT_STATUS_LABELS[s] ?? s),
    ),
  };
}

/** Ídem para partidos. */
export function canTransitionMatch(
  from: MatchStatus,
  to: MatchStatus,
): RuleResult {
  if (from === to) return { ok: true };

  const allowed = allowedMatchTransitions(from);
  if (allowed.includes(to)) return { ok: true };

  return {
    ok: false,
    error: transitionError(
      MATCH_STATUS_LABELS[from] ?? from,
      MATCH_STATUS_LABELS[to] ?? to,
      allowed.map((s) => MATCH_STATUS_LABELS[s] ?? s),
    ),
  };
}

/**
 * ¿Se puede **crear** un partido directamente en este estado?
 *
 * Se mide contra `PROGRAMADO`, que es donde nace un partido: así la regla sale
 * del mismo grafo y no de una segunda lista que se desincroniza. En la práctica
 * deja crear un partido ya jugado (carga histórica) y frena los estados "en
 * vivo" imposibles, como `ENTRETIEMPO`.
 */
export function canCreateMatchWithStatus(status: MatchStatus): RuleResult {
  const check = canTransitionMatch("PROGRAMADO", status);
  if (check.ok) return check;
  return {
    ok: false,
    error: `Un partido no se puede crear en estado «${MATCH_STATUS_LABELS[status] ?? status}».`,
  };
}
