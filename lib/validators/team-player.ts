import { z } from "zod";
import { PlayerStatus } from "@prisma/client";
import {
  emptyToUndefined,
  nullableDate,
  nullableInt,
  nullableString,
} from "./common";

export const teamPlayerCreateSchema = z.object({
  tournamentTeamId: z.string().min(1),
  playerId: z.string().min(1),
  // "" u omitido → undefined → Prisma aplica @default(now())
  joinedAt: z.preprocess(emptyToUndefined, z.coerce.date().optional()),
  leftAt: nullableDate().optional(),
  position: nullableString(50).optional(),
  number: nullableInt(0, 999).optional(),
  status: z.enum(PlayerStatus).optional(),
});

export type TeamPlayerCreateInput = z.infer<typeof teamPlayerCreateSchema>;
