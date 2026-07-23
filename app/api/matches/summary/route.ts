import { NextRequest, NextResponse } from "next/server";
import { MatchStatus, Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getPanelOrgIds } from "@/lib/orgAuth";

/**
 * Resumen de partidos para las cabeceras (A3): totales por estado, cuántos hay
 * hoy y los torneos que tienen partidos (para el filtro). Vive aparte de la
 * lista paginada porque estas cifras miran **todo** el conjunto, no una página.
 * Tres queries livianas (conteos + distinct), sin traer filas completas.
 * ?scope=panel: acota a las organizaciones del usuario.
 */
export async function GET(req: NextRequest) {
  try {
    let where: Prisma.MatchWhereInput = {};
    if (req.nextUrl.searchParams.get("scope") === "panel") {
      const orgIds = await getPanelOrgIds();
      if (orgIds !== null) {
        where = { tournament: { organizationId: { in: orgIds } } };
      }
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const [grouped, today, tournamentRows] = await Promise.all([
      db.match.groupBy({
        by: ["status"],
        where,
        _count: { _all: true },
      }),
      db.match.count({
        where: { ...where, dateTime: { gte: startOfDay, lt: endOfDay } },
      }),
      db.match.findMany({
        where,
        select: { tournamentId: true, tournament: { select: { name: true } } },
        distinct: ["tournamentId"],
        orderBy: { tournament: { name: "asc" } },
      }),
    ]);

    const byStatus = Object.fromEntries(
      Object.values(MatchStatus).map((s) => [s, 0]),
    ) as Record<MatchStatus, number>;
    let total = 0;
    for (const row of grouped) {
      byStatus[row.status] = row._count._all;
      total += row._count._all;
    }

    const tournaments = tournamentRows.map((r) => ({
      id: r.tournamentId,
      name: r.tournament.name,
    }));

    return NextResponse.json(
      { total, today, byStatus, tournaments },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching matches summary:", error);
    return NextResponse.json(
      { error: "Error fetching matches summary" },
      { status: 500 },
    );
  }
}
