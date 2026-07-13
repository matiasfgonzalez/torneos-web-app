import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db"; // Asegúrate de tener este cliente configurado
import { MatchStatus } from "@prisma/client";
import {
  applyMatchResult,
  extractMatchResult,
} from "@/lib/standings/calculate-standings";
import { resolveWalkover } from "@/lib/standings/walkover";
import { recomputeTournamentSuspensions } from "@/lib/suspensions/engine";
import {
  getPanelOrgIds,
  requireApiOrgAccess,
} from "@/lib/orgAuth";
import { matchCreateSchema } from "@/lib/validators/match";
import { validationErrorResponse } from "@/lib/validators/common";

// GET /api/matches
// Público: todos los partidos (difusión).
// ?scope=panel (N3): solo partidos de las organizaciones del usuario
// (ADMINISTRADOR ve todos, salvo "ver como organización" activo).
export async function GET(req: NextRequest) {
  try {
    let where = {};
    if (req.nextUrl.searchParams.get("scope") === "panel") {
      const orgIds = await getPanelOrgIds();
      if (orgIds !== null) {
        where = { tournament: { organizationId: { in: orgIds } } };
      }
    }

    const matches = await db.match.findMany({
      where,
      include: {
        // organization.slug: para enlazar a la URL canónica del torneo
        // desde el listado público (tournamentPublicPath, F2)
        tournament: {
          include: { organization: { select: { slug: true } } },
        },
        homeTeam: {
          include: { team: true },
        },
        awayTeam: {
          include: { team: true },
        },
        tournamentPhase: true,
        goals: true,
      },
      orderBy: { dateTime: "asc" },
    });

    return NextResponse.json(matches, { status: 200 });
  } catch (error) {
    console.error("Error fetching matches:", error);
    return NextResponse.json(
      { error: "Error fetching matches" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = matchCreateSchema.safeParse(body);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    // El partido pertenece al torneo → solo gestores de esa organización
    // (traemos la config deportiva del torneo: puntos + walkoverScore, N7)
    const tournament = await db.tournament.findUnique({
      where: { id: parsed.data.tournamentId },
      select: {
        organizationId: true,
        pointsWin: true,
        pointsDraw: true,
        pointsLoss: true,
        walkoverScore: true,
      },
    });
    if (!tournament) {
      return NextResponse.json(
        { error: "Torneo no encontrado" },
        { status: 404 },
      );
    }

    const auth = await requireApiOrgAccess(tournament.organizationId);
    if (auth.error) {
      return auth.error;
    }

    const data = { ...parsed.data };

    // Regla WALKOVER (N7): el organizador marca el ganador y el server fija
    // el marcador (walkoverScore-0). Ya no se carga el 3-0 a mano.
    if (data.status === MatchStatus.WALKOVER) {
      const wo = resolveWalkover({
        status: data.status,
        walkoverWinnerTeamId: data.walkoverWinnerTeamId,
        homeTeamId: data.homeTeamId,
        awayTeamId: data.awayTeamId,
        walkoverScore: tournament.walkoverScore,
      });
      if (!wo.ok) {
        return NextResponse.json({ error: wo.error }, { status: 400 });
      }
      data.homeScore = wo.homeScore;
      data.awayScore = wo.awayScore;
    }

    // 📌 Crear partido + tabla de posiciones en una única transacción
    // (applyMatchResult no hace nada si el partido no es contable)
    const match = await db.$transaction(async (tx) => {
      const created = await tx.match.create({
        data,
      });

      await applyMatchResult(tx, null, extractMatchResult(created), {
        pointsWin: tournament.pointsWin,
        pointsDraw: tournament.pointsDraw,
        pointsLoss: tournament.pointsLoss,
      });

      return created;
    });

    // Recalcular sanciones si nace finalizado (afecta fechas cumplidas, N8)
    if (match.status === MatchStatus.FINALIZADO) {
      await recomputeTournamentSuspensions(match.tournamentId);
    }

    return NextResponse.json(match, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al crear el partido" },
      { status: 500 },
    );
  }
}
