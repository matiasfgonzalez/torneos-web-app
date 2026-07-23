import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
  applyMatchResult,
  extractMatchResult,
} from "@/lib/standings/calculate-standings";
import { resolveWalkover } from "@/lib/standings/walkover";
import { recomputeTournamentSuspensions } from "@/lib/suspensions/engine";
import { requireApiOrgAccess } from "@/lib/orgAuth";
import { matchUpdateSchema } from "@/lib/validators/match";
import { validationErrorResponse } from "@/lib/validators/common";
import { canEditMatchInTournament, validateMatchRules } from "@/lib/match-rules";
import { assertTeamsInTournament } from "@/lib/match-guards";
import { getTeamManagerIdsForTeams, notify } from "@/lib/notifications";

type tParams = Promise<{ id: string }>;

/**
 * Avisa el resultado a los delegados de ambos equipos (S5).
 *
 * `homeTeamId`/`awayTeamId` del partido son ids de **TournamentTeam**, no de
 * Team: hay que resolverlos para llegar a los delegados y al nombre.
 */
async function notifyMatchResult(
  matchId: string,
  match: { homeTeamId: string; awayTeamId: string; homeScore: number | null; awayScore: number | null },
  tournamentName: string,
  actorId: string,
): Promise<void> {
  // Un partido FINALIZADO sin marcador no tiene resultado que contar.
  if (match.homeScore === null || match.awayScore === null) return;

  const sides = await db.tournamentTeam.findMany({
    where: { id: { in: [match.homeTeamId, match.awayTeamId] } },
    select: { id: true, team: { select: { id: true, name: true } } },
  });

  const home = sides.find((s) => s.id === match.homeTeamId);
  const away = sides.find((s) => s.id === match.awayTeamId);
  if (!home || !away) return;

  await notify(
    await getTeamManagerIdsForTeams([home.team.id, away.team.id]),
    {
      type: "RESULTADO_CARGADO",
      matchId,
      tournamentName,
      homeTeamName: home.team.name,
      awayTeamName: away.team.name,
      homeScore: match.homeScore,
      awayScore: match.awayScore,
    },
    { exclude: actorId },
  );
}

export async function PATCH(req: NextRequest, { params }: { params: tParams }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "ID no proporcionado" },
        { status: 400 },
      );
    }

    // 📌 Obtener estado anterior del partido ANTES de actualizar
    // (incluye la config deportiva del torneo: puntos + walkoverScore, N7)
    const previousMatch = await db.match.findUnique({
      where: { id },
      select: {
        homeTeamId: true,
        awayTeamId: true,
        homeScore: true,
        awayScore: true,
        status: true,
        tournamentId: true,
        tournamentPhaseId: true,
        walkoverWinnerTeamId: true,
        tournament: {
          select: {
            name: true,
            status: true,
            organizationId: true,
            pointsWin: true,
            pointsDraw: true,
            pointsLoss: true,
            walkoverScore: true,
          },
        },
      },
    });

    if (!previousMatch) {
      return NextResponse.json(
        { error: "Partido no encontrado" },
        { status: 404 },
      );
    }

    // Carga de resultados: COLABORADOR también puede
    const auth = await requireApiOrgAccess(
      previousMatch.tournament.organizationId,
      { allowCollaborator: true },
    );
    if (auth.error) {
      return auth.error;
    }

    // M11: un torneo archivado/cancelado no deja editar resultados. Finalizado
    // sí (correcciones y protestas son reales).
    const canEdit = canEditMatchInTournament(previousMatch.tournament.status);
    if (!canEdit.ok) {
      return NextResponse.json({ error: canEdit.error }, { status: 409 });
    }

    const body = await req.json();

    const parsed = matchUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    const data = { ...parsed.data };

    // Regla WALKOVER (N7): el organizador marca el ganador y el server fija
    // el marcador (walkoverScore-0). Se usan los valores efectivos porque el
    // update puede no reenviar equipos ni ganador.
    const effectiveStatus = data.status ?? previousMatch.status;
    if (effectiveStatus === "WALKOVER") {
      const wo = resolveWalkover({
        status: effectiveStatus,
        walkoverWinnerTeamId:
          data.walkoverWinnerTeamId ?? previousMatch.walkoverWinnerTeamId,
        homeTeamId: data.homeTeamId ?? previousMatch.homeTeamId,
        awayTeamId: data.awayTeamId ?? previousMatch.awayTeamId,
        walkoverScore: previousMatch.tournament.walkoverScore,
      });
      if (!wo.ok) {
        return NextResponse.json({ error: wo.error }, { status: 400 });
      }
      data.homeScore = wo.homeScore;
      data.awayScore = wo.awayScore;
    }

    // M11: invariantes sobre los valores **efectivos** (el update puede reenviar
    // solo algunos campos; el resto queda como estaba).
    const effHomeTeamId = data.homeTeamId ?? previousMatch.homeTeamId;
    const effAwayTeamId = data.awayTeamId ?? previousMatch.awayTeamId;
    const rules = validateMatchRules({
      homeTeamId: effHomeTeamId,
      awayTeamId: effAwayTeamId,
      status: effectiveStatus,
      homeScore: data.homeScore ?? previousMatch.homeScore,
      awayScore: data.awayScore ?? previousMatch.awayScore,
      isWalkover: effectiveStatus === "WALKOVER",
    });
    if (!rules.ok) {
      return NextResponse.json({ error: rules.error }, { status: 400 });
    }

    // Solo si se están cambiando los equipos hace falta re-verificar que
    // pertenezcan al torneo (al crearse ya se validó).
    if (data.homeTeamId != null || data.awayTeamId != null) {
      const teamsCheck = await assertTeamsInTournament(
        previousMatch.tournamentId,
        effHomeTeamId,
        effAwayTeamId,
      );
      if (!teamsCheck.ok) {
        return NextResponse.json({ error: teamsCheck.error }, { status: 400 });
      }
    }

    // 📌 Actualizar partido + tabla de posiciones en una única transacción
    const updatedMatch = await db.$transaction(async (tx) => {
      const updated = await tx.match.update({
        where: { id },
        data,
      });

      await applyMatchResult(
        tx,
        extractMatchResult(previousMatch),
        extractMatchResult(updated),
        {
          pointsWin: previousMatch.tournament.pointsWin,
          pointsDraw: previousMatch.tournament.pointsDraw,
          pointsLoss: previousMatch.tournament.pointsLoss,
        },
      );

      return updated;
    });

    // Recalcular sanciones si el partido entra o sale de FINALIZADO, o si se
    // edita uno finalizado (cambia las fechas cumplidas, N8)
    const wasFinalized = previousMatch.status === "FINALIZADO";
    const isFinalized = updatedMatch.status === "FINALIZADO";
    if (wasFinalized || isFinalized) {
      await recomputeTournamentSuspensions(updatedMatch.tournamentId);
    }

    // Aviso del resultado a los delegados de los dos equipos (S5). Solo en la
    // **transición** a FINALIZADO: editar un partido ya finalizado (corregir un
    // gol mal cargado) no es una novedad que merezca otro mail, y este PATCH es
    // el mismo que usa la carga en vivo — notificar en cada uno sería spam.
    if (!wasFinalized && isFinalized) {
      await notifyMatchResult(id, updatedMatch, previousMatch.tournament.name, auth.user.id);
    }

    return NextResponse.json(updatedMatch, { status: 200 });
  } catch (error) {
    console.error("Error en PATCH /api/matches/[id]:", error);
    return NextResponse.json(
      { error: "Error al actualizar el partido" },
      { status: 500 },
    );
  }
}
