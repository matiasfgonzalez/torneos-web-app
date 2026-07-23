import type { MatchStatus, TournamentStatus } from "@prisma/client";

/**
 * Reglas de negocio de un partido y del torneo que lo contiene (M11) — puras y
 * testeables. El **server** las aplica (los validadores Zod cubren la forma del
 * dato; esto cubre las invariantes que dependen de varios campos o del torneo).
 * Devuelven un mensaje pensado para el organizador, no un booleano pelado.
 */

export type RuleResult = { ok: true } | { ok: false; error: string };

/**
 * Estados en los que un torneo queda **de solo lectura** para sus partidos: no
 * se crean ni se editan. Son terminales — archivado es "guardado y cerrado",
 * cancelado es "no se jugó". `FINALIZADO` NO está acá a propósito: un torneo
 * terminado todavía puede necesitar corregir un resultado mal cargado (una
 * protesta, un typo en la final). Lo que sí se bloquea en FINALIZADO es **sumar
 * partidos nuevos** (ver `canCreateMatchInTournament`).
 */
export const MATCH_READONLY_TOURNAMENT_STATUSES: TournamentStatus[] = [
  "ARCHIVADO",
  "CANCELADO",
];

/** ¿El torneo está cerrado a cualquier cambio en sus partidos? */
export function isTournamentReadOnlyForMatches(
  status: TournamentStatus,
): boolean {
  return MATCH_READONLY_TOURNAMENT_STATUSES.includes(status);
}

/** ¿Se puede **crear** un partido en un torneo con este estado? */
export function canCreateMatchInTournament(status: TournamentStatus): RuleResult {
  if (isTournamentReadOnlyForMatches(status)) {
    return {
      ok: false,
      error:
        status === "ARCHIVADO"
          ? "El torneo está archivado. Desarchivalo para modificar sus partidos."
          : "El torneo está cancelado: no se pueden cargar partidos.",
    };
  }
  if (status === "FINALIZADO") {
    return {
      ok: false,
      error:
        "El torneo ya está finalizado. Para agregar partidos, reabrilo cambiando su estado.",
    };
  }
  return { ok: true };
}

/** ¿Se puede **editar** un partido de un torneo con este estado? */
export function canEditMatchInTournament(status: TournamentStatus): RuleResult {
  if (isTournamentReadOnlyForMatches(status)) {
    return {
      ok: false,
      error:
        status === "ARCHIVADO"
          ? "El torneo está archivado: sus resultados no se editan."
          : "El torneo está cancelado: sus resultados no se editan.",
    };
  }
  return { ok: true };
}

export interface MatchRuleInput {
  homeTeamId: string;
  awayTeamId: string;
  /** Estado **efectivo** del partido (el que va a quedar guardado). */
  status: MatchStatus;
  homeScore: number | null;
  awayScore: number | null;
  /** En walkover el server fija el marcador: no se exige cargarlo a mano (N7). */
  isWalkover: boolean;
}

/**
 * Invariantes de un partido que no necesitan tocar la base: un equipo no juega
 * contra sí mismo, un partido finalizado tiene marcador, y el marcador no es
 * negativo. La pertenencia de los equipos al torneo se chequea aparte (necesita
 * la base).
 */
export function validateMatchRules(input: MatchRuleInput): RuleResult {
  if (input.homeTeamId === input.awayTeamId) {
    return { ok: false, error: "Un equipo no puede jugar contra sí mismo." };
  }

  // Defensa en profundidad: el schema Zod ya corta los negativos, pero la regla
  // vive acá para que el server no dependa solo del validador de forma.
  if (
    (input.homeScore != null && input.homeScore < 0) ||
    (input.awayScore != null && input.awayScore < 0)
  ) {
    return { ok: false, error: "El marcador no puede ser negativo." };
  }

  // Un partido finalizado necesita resultado. El walkover es la excepción: el
  // marcador lo pone el server (walkoverScore-0), así que no se exige acá.
  if (
    input.status === "FINALIZADO" &&
    !input.isWalkover &&
    (input.homeScore == null || input.awayScore == null)
  ) {
    return {
      ok: false,
      error: "Un partido finalizado necesita el marcador de los dos equipos.",
    };
  }

  return { ok: true };
}
