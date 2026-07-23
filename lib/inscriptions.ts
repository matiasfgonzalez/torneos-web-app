/**
 * Reglas de inscripción a un torneo (S3) — puras y testeables.
 *
 * Viven acá y no dentro del server action porque son reglas de negocio: la UI
 * las necesita para mostrar "cierra el viernes" o "quedan 2 cupos", y el server
 * para decidir. Una sola fuente evita que la UI diga una cosa y el server otra.
 */

export interface RegistrationWindow {
  maxTeams: number | null;
  registrationDeadline: Date | string | null;
  /** Equipos con inscripción ya aprobada. */
  takenSlots: number;
}

/** ¿Pasó la fecha límite? Sin fecha, nunca cierra por tiempo. */
export function isRegistrationClosed(
  deadline: Date | string | null | undefined,
  now: Date = new Date(),
): boolean {
  if (!deadline) return false;
  const limit = deadline instanceof Date ? deadline : new Date(deadline);
  if (Number.isNaN(limit.getTime())) return false;
  return now.getTime() > limit.getTime();
}

/** Cupos libres. `null` = sin cupo definido (ilimitado). */
export function remainingSlots(
  maxTeams: number | null | undefined,
  takenSlots: number,
): number | null {
  if (maxTeams == null) return null;
  return Math.max(0, maxTeams - takenSlots);
}

/**
 * Capacidad REAL de un torneo: la más chica entre el cupo que puso el
 * organizador y el que permite el plan de su liga.
 *
 * Son dos límites distintos y hay que distinguirlos, porque **le hablan a
 * gente distinta**:
 * - `tournament`: lo eligió el organizador ("este torneo es de 8 equipos").
 *   Se le puede decir a cualquiera.
 * - `plan`: es la relación comercial de la liga con la plataforma. Al
 *   organizador se le muestra con el upsell; **al delegado nunca** — no es su
 *   problema y expone a la liga.
 */
export function effectiveCapacity(
  tournamentMax: number | null | undefined,
  planMax: number,
): { limit: number; source: "tournament" | "plan" } {
  if (tournamentMax == null || planMax < tournamentMax) {
    return { limit: planMax, source: "plan" };
  }
  return { limit: tournamentMax, source: "tournament" };
}

export type InscriptionBlock =
  | { open: true }
  | { open: false; reason: "deadline" | "full" | "status"; message: string };

// ============================================================
// Arancel de inscripción (S3) — cobro manual
// ============================================================

/**
 * Estado de pago con el que nace una inscripción. Sin arancel (o arancel 0) el
 * equipo queda `EXENTO`: no hay nada que cobrar y no se le pide nada al delegado.
 * Devuelve literales (no el enum de Prisma) para que este módulo siga puro.
 */
export function initialPaymentStatus(
  fee: number | null | undefined,
): "EXENTO" | "PENDIENTE" {
  return fee != null && fee > 0 ? "PENDIENTE" : "EXENTO";
}

/** ¿El torneo cobra inscripción? */
export function hasInscriptionFee(fee: number | null | undefined): boolean {
  return fee != null && fee > 0;
}

/** Arancel en texto para el usuario ("$1.500" o "Gratis"). Moneda: ARS. */
export function formatFee(amount: number | null | undefined): string {
  if (amount == null || amount <= 0) return "Gratis";
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Fecha límite en texto para el usuario ("viernes 20 de agosto, 23:59"). */
export function formatDeadline(deadline: Date | string): string {
  const date = deadline instanceof Date ? deadline : new Date(deadline);
  return date.toLocaleString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * ¿Se puede pedir inscripción? Devuelve el motivo del cierre, no un booleano
 * pelado: "no podés anotarte" sin decir por qué obliga a adivinar.
 */
export function canRequestInscription(
  window: RegistrationWindow & { status: string },
  now: Date = new Date(),
): InscriptionBlock {
  if (window.status !== "INSCRIPCION") {
    return {
      open: false,
      reason: "status",
      message: "Este torneo no está recibiendo inscripciones.",
    };
  }

  if (isRegistrationClosed(window.registrationDeadline, now)) {
    return {
      open: false,
      reason: "deadline",
      message: `Las inscripciones cerraron el ${formatDeadline(window.registrationDeadline!)}.`,
    };
  }

  const left = remainingSlots(window.maxTeams, window.takenSlots);
  if (left === 0) {
    return {
      open: false,
      reason: "full",
      message: `Ya se cubrieron los ${window.maxTeams} cupos.`,
    };
  }

  return { open: true };
}
