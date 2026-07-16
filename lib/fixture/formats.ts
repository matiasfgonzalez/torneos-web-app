import { TournamentFormat } from "@prisma/client";

/**
 * Qué genera el fixture para cada formato (S1) — cierra el pendiente del TODO
 * ("marcar qué formatos soporta realmente el generador y ocultar el resto").
 *
 * El enum `TournamentFormat` tiene 14 valores heredados y casi ninguno tenía
 * implementación: se podía crear un torneo "SUIZO" que nada en el sistema sabía
 * manejar. Este mapa es la fuente única de verdad de qué se puede generar.
 */
export type FixtureStrategy = "ROUND_ROBIN" | "GROUPS" | "KNOCKOUT";

export const FIXTURE_STRATEGY_BY_FORMAT: Partial<
  Record<TournamentFormat, FixtureStrategy>
> = {
  // Todos contra todos en una sola tabla
  LIGA: "ROUND_ROBIN",
  IDA_Y_VUELTA: "ROUND_ROBIN",
  ROUND_ROBIN: "ROUND_ROBIN",
  TODOS_CONTRA_TODOS: "ROUND_ROBIN",
  LIGUILLA: "ROUND_ROBIN",
  PUNTOS_ACUMULADOS: "ROUND_ROBIN",

  // Zonas con todos contra todos dentro de cada una
  GRUPOS: "GROUPS",

  // Cuadro de eliminación directa (solo primera ronda — ver knockout.ts)
  ELIMINACION_DIRECTA: "KNOCKOUT",
  COPA: "KNOCKOUT",
  PLAYOFFS: "KNOCKOUT",
};

/**
 * Formatos **sin** generador, con el motivo. No es que falte escribirlos: cada
 * uno necesita algo que el modelo o el flujo todavía no tienen.
 */
export const FORMATS_WITHOUT_GENERATOR: Partial<
  Record<TournamentFormat, string>
> = {
  SUIZO:
    "El sistema suizo empareja cada ronda según los resultados de la anterior, así que no existe un fixture completo para generar de una vez.",
  DOBLE_ELIMINACION:
    "Necesita un cuadro de perdedores, que el modelo de fases todavía no representa.",
  MIXTO:
    "Combina grupos y llaves con reglas propias de cada torneo: generá cada fase por separado.",
  AMISTOSO: "Un amistoso es un partido suelto: cargalo a mano.",
};

export const supportsFixture = (format: TournamentFormat): boolean =>
  format in FIXTURE_STRATEGY_BY_FORMAT;

export const strategyFor = (
  format: TournamentFormat,
): FixtureStrategy | undefined => FIXTURE_STRATEGY_BY_FORMAT[format];

/** Motivo por el que un formato no se puede generar (para mostrarlo en la UI). */
export const reasonWithoutGenerator = (
  format: TournamentFormat,
): string | undefined => FORMATS_WITHOUT_GENERATOR[format];
