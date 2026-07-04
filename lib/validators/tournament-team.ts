import { z } from "zod";
import { nullableString } from "./common";

const standingStat = z.coerce.number().int().min(-999).max(9999);

const tournamentTeamBase = z.object({
  group: nullableString(20),
  isEliminated: z.boolean(),
  notes: nullableString(500),
  matchesPlayed: standingStat,
  wins: standingStat,
  draws: standingStat,
  losses: standingStat,
  goalsFor: standingStat,
  goalsAgainst: standingStat,
  goalDifference: standingStat,
  points: standingStat,
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
