import { z } from "zod";
import { MatchStatus } from "@prisma/client";
import { nullableInt, nullableString } from "./common";

const matchBase = z.object({
  dateTime: z.coerce.date(),
  stadium: nullableString(120),
  city: nullableString(120),
  description: nullableString(1000),
  status: z.enum(MatchStatus),
  tournamentId: z.string().min(1),
  homeTeamId: z.string().min(1),
  awayTeamId: z.string().min(1),
  phaseId: nullableString(64),
  tournamentPhaseId: nullableString(64),
  homeScore: nullableInt(0, 99),
  awayScore: nullableInt(0, 99),
  penaltyWinnerTeamId: nullableString(64),
  penaltyScoreHome: nullableInt(0, 99),
  penaltyScoreAway: nullableInt(0, 99),
  roundNumber: nullableInt(1, 999),
});

export const matchCreateSchema = matchBase.partial({
  stadium: true,
  city: true,
  description: true,
  status: true,
  phaseId: true,
  tournamentPhaseId: true,
  homeScore: true,
  awayScore: true,
  penaltyWinnerTeamId: true,
  penaltyScoreHome: true,
  penaltyScoreAway: true,
  roundNumber: true,
});

export const matchUpdateSchema = matchBase.partial();

export type MatchCreateInput = z.infer<typeof matchCreateSchema>;
export type MatchUpdateInput = z.infer<typeof matchUpdateSchema>;
