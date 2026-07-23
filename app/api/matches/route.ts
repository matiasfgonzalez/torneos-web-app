import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db"; // Asegúrate de tener este cliente configurado
import { MatchStatus, Prisma } from "@prisma/client";
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

// GET /api/matches — listado paginado y filtrado (A3).
//
// Antes traía **todos** los partidos de la BD con `goals` incluidos (payload
// gigante: cada partido arrastraba su lista de goles, que la lista ni dibuja).
// Ahora:
//   - `select` mínimo: escalares del partido + solo los campos de equipo/torneo
//     que la tarjeta y la hoja de edición usan. Sin `goals`/`cards`/`referees`
//     (el detalle se pide aparte, `getMatchEvents`).
//   - filtros en el server: `q` (equipos/torneo/estadio), `status`, `tournamentId`.
//   - paginación `page`/`limit` → `{ data, total, page, limit, totalPages }`.
// ?scope=panel (N3): solo partidos de las organizaciones del usuario.
const MATCH_LIST_SELECT = {
  id: true,
  dateTime: true,
  stadium: true,
  city: true,
  description: true,
  status: true,
  homeScore: true,
  awayScore: true,
  tournamentId: true,
  homeTeamId: true,
  awayTeamId: true,
  tournamentPhaseId: true,
  roundNumber: true,
  penaltyWinnerTeamId: true,
  penaltyScoreHome: true,
  penaltyScoreAway: true,
  walkoverWinnerTeamId: true,
  tournament: {
    select: {
      id: true,
      name: true,
      slug: true,
      organization: { select: { slug: true } },
    },
  },
  homeTeam: {
    select: {
      id: true,
      team: { select: { id: true, name: true, shortName: true, logoUrl: true } },
    },
  },
  awayTeam: {
    select: {
      id: true,
      team: { select: { id: true, name: true, shortName: true, logoUrl: true } },
    },
  },
  tournamentPhase: { select: { id: true, name: true } },
} as const;

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 50;

/** `where` de partidos según scope + filtros de la query. Reutiliza summary. */
async function buildMatchWhere(params: URLSearchParams) {
  const and: Prisma.MatchWhereInput[] = [];

  if (params.get("scope") === "panel") {
    const orgIds = await getPanelOrgIds();
    if (orgIds !== null) {
      and.push({ tournament: { organizationId: { in: orgIds } } });
    }
  }

  const status = params.get("status");
  if (status && status !== "all") {
    and.push({ status: status as MatchStatus });
  }

  const tournamentId = params.get("tournamentId");
  if (tournamentId && tournamentId !== "all") {
    and.push({ tournamentId });
  }

  const q = params.get("q")?.trim();
  if (q) {
    const contains = { contains: q, mode: "insensitive" as const };
    and.push({
      OR: [
        { homeTeam: { team: { name: contains } } },
        { awayTeam: { team: { name: contains } } },
        { tournament: { name: contains } },
        { stadium: contains },
      ],
    });
  }

  return and.length ? { AND: and } : {};
}

export async function GET(req: NextRequest) {
  try {
    const params = req.nextUrl.searchParams;
    const where = await buildMatchWhere(params);

    const page = Math.max(1, Number(params.get("page")) || 1);
    const limit = Math.min(
      MAX_LIMIT,
      Math.max(1, Number(params.get("limit")) || DEFAULT_LIMIT),
    );

    const [data, total] = await Promise.all([
      db.match.findMany({
        where,
        select: MATCH_LIST_SELECT,
        orderBy: { dateTime: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.match.count({ where }),
    ]);

    return NextResponse.json(
      { data, total, page, limit, totalPages: Math.ceil(total / limit) },
      { status: 200 },
    );
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
