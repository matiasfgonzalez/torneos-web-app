import { TournamentFormat } from "@prisma/client";

/**
 * Qué genera el fixture para cada formato (S1).
 *
 * Desde M13 el enum tiene **tres** valores y los tres tienen generador: el mapa
 * dejó de ser parcial. Antes eran 14 valores para 3 estrategias, con diez
 * sinónimos y promesas sin implementación —se podía crear un torneo "SUIZO" que
 * nada en el sistema sabía manejar—, así que este archivo cargaba además la
 * lista de "formatos sin generador" con el motivo de cada uno, y la UI tenía una
 * rama para explicar por qué no había botón. Eso se fue junto con los valores
 * que lo justificaban.
 */
export type FixtureStrategy = "ROUND_ROBIN" | "GROUPS" | "KNOCKOUT";

export const FIXTURE_STRATEGY_BY_FORMAT: Record<
  TournamentFormat,
  FixtureStrategy
> = {
  // Todos contra todos en una sola tabla. La ida y vuelta es `homeAndAway`.
  LIGA: "ROUND_ROBIN",

  // Zonas con todos contra todos dentro de cada una
  GRUPOS: "GROUPS",

  // Cuadro de eliminación directa (solo primera ronda — ver knockout.ts)
  ELIMINACION_DIRECTA: "KNOCKOUT",
};

export const strategyFor = (format: TournamentFormat): FixtureStrategy =>
  FIXTURE_STRATEGY_BY_FORMAT[format];
