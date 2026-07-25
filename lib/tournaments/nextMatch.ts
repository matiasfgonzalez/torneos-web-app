import { db } from "@/lib/db";

/**
 * "Próximo partido" de un torneo (A6): derivado, no un campo denormalizado.
 *
 * Es el partido **PROGRAMADO** más próximo (menor `dateTime`). Antes vivía como
 * `Tournament.nextMatch`, un campo que el organizador cargaba a mano y quedaba
 * viejo apenas se jugaba la fecha. Ahora se calcula con una query y se adjunta a
 * `ITorneo` en los listados/detalle.
 */

/** Fecha del próximo partido de un torneo (o `null` si no hay programados). */
export async function nextMatchDateFor(
  tournamentId: string,
): Promise<Date | null> {
  const agg = await db.match.aggregate({
    where: { tournamentId, status: "PROGRAMADO" },
    _min: { dateTime: true },
  });
  return agg._min.dateTime ?? null;
}

/**
 * Próximo partido para VARIOS torneos de una (evita el N+1 en los listados):
 * una sola `groupBy` con el mínimo `dateTime` por torneo.
 */
export async function nextMatchDatesFor(
  tournamentIds: string[],
): Promise<Map<string, Date | null>> {
  if (tournamentIds.length === 0) return new Map();

  const grouped = await db.match.groupBy({
    by: ["tournamentId"],
    where: { tournamentId: { in: tournamentIds }, status: "PROGRAMADO" },
    _min: { dateTime: true },
  });

  const map = new Map<string, Date | null>();
  for (const id of tournamentIds) map.set(id, null);
  for (const row of grouped) map.set(row.tournamentId, row._min.dateTime ?? null);
  return map;
}

/**
 * Misma derivación pero SIN query: para cuando los partidos del torneo ya
 * vinieron en el `include` (detalle). Evita una ida extra a la base.
 */
export function nextMatchFromMatches(
  matches: { status: string; dateTime: Date | string | null }[],
): Date | null {
  let min: Date | null = null;
  for (const m of matches) {
    if (m.status !== "PROGRAMADO" || !m.dateTime) continue;
    const d = m.dateTime instanceof Date ? m.dateTime : new Date(m.dateTime);
    if (!min || d < min) min = d;
  }
  return min;
}
