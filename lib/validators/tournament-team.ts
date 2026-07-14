import { z } from "zod";
import { nullableString } from "./common";

/**
 * Inscripción de un equipo en un torneo.
 *
 * (F3, decisión del usuario 2026-07-14 — cierra el punto 5 de C6): la API ya
 * **no acepta estadísticas de standings** (`matchesPlayed`, `wins`, `draws`,
 * `losses`, `goalsFor`, `goalsAgainst`, `goalDifference`, `points`). Eran doble
 * fuente de verdad: el cliente podía escribir números que el siguiente recálculo
 * de la tabla —el que sale de los partidos, `lib/standings/*`— pisaba igual.
 * Un ajuste manual de puntos (quita por sanción) va por `bonusPoints`, que el
 * recálculo respeta.
 */
const tournamentTeamBase = z.object({
  group: nullableString(20),
  isEliminated: z.boolean(),
  notes: nullableString(500),
});

export const tournamentTeamCreateSchema = tournamentTeamBase.partial().extend({
  tournamentId: z.string().min(1),
  teamId: z.string().min(1),
});

export const tournamentTeamUpdateSchema = tournamentTeamBase.partial();

export type TournamentTeamCreateInput = z.infer<
  typeof tournamentTeamCreateSchema
>;
export type TournamentTeamUpdateInput = z.infer<
  typeof tournamentTeamUpdateSchema
>;
