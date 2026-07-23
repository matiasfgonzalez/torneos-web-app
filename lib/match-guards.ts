import { db } from "@/lib/db";
import type { RuleResult } from "@/lib/match-rules";

/**
 * Guardas de partido que **tocan la base** (M11). Se separan de `match-rules.ts`,
 * que es puro y testeable sin Prisma; acá viven las que necesitan consultar.
 */

/**
 * Los dos equipos de un partido tienen que pertenecer al torneo: se busca que
 * existan como `TournamentTeam` de ese torneo. Sin esto se podía programar un
 * partido con equipos de otro torneo, o con ids inventados.
 *
 * Asume que los ids ya son distintos (el auto-partido lo corta `validateMatchRules`
 * antes, con un mensaje propio).
 */
export async function assertTeamsInTournament(
  tournamentId: string,
  homeTeamId: string,
  awayTeamId: string,
): Promise<RuleResult> {
  const count = await db.tournamentTeam.count({
    where: { tournamentId, id: { in: [homeTeamId, awayTeamId] } },
  });
  if (count < 2) {
    return {
      ok: false,
      error: "Los dos equipos tienen que estar inscriptos en este torneo.",
    };
  }
  return { ok: true };
}
