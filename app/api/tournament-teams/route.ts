// /app/api/tournament-teams/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getTournamentOrgId, requireApiOrgAccess } from "@/lib/orgAuth";
import { assertPlanLimit } from "@/lib/planLimits";
import { tournamentTeamCreateSchema } from "@/lib/validators/tournament-team";
import { validationErrorResponse } from "@/lib/validators/common";
import { notify } from "@/lib/notifications";

/**
 * Avisa al delegado cuando **otra liga** inscribe su equipo (M14 fase 2).
 *
 * Se avisa, no se pide aprobación: un club que juega en dos ligas quiere estar
 * en las dos, y exigir permiso trabaría el caso normal dejando al organizador
 * esperando a alguien que capaz no entra en una semana. Pero el delegado tiene
 * que enterarse, porque es su representación la que entra a ese torneo.
 *
 * No corta la inscripción si algo falla: el equipo ya quedó anotado y un aviso
 * perdido no justifica devolver un error al organizador.
 */
async function avisarSiEsDeOtraLiga(
  teamId: string,
  tournamentId: string,
  inscribeOrgId: string,
) {
  try {
    const team = await db.team.findUnique({
      where: { id: teamId },
      select: {
        name: true,
        organizationId: true,
        managers: {
          where: { status: "APROBADO" },
          select: { userId: true },
        },
      },
    });

    // Solo si el equipo es de otra liga y tiene delegado a quien avisarle.
    if (!team || team.organizationId === inscribeOrgId) return;
    if (team.managers.length === 0) return;

    const [tournament, org] = await Promise.all([
      db.tournament.findUnique({
        where: { id: tournamentId },
        select: { name: true },
      }),
      db.organization.findUnique({
        where: { id: inscribeOrgId },
        select: { name: true },
      }),
    ]);
    if (!tournament || !org) return;

    await notify(
      team.managers.map((m) => m.userId),
      {
        type: "EQUIPO_INSCRIPTO_POR_OTRA_LIGA",
        teamName: team.name,
        tournamentName: tournament.name,
        tournamentId,
        organizationName: org.name,
      },
    );
  } catch (error) {
    console.error("No se pudo avisar al delegado de la inscripción:", error);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parsed = tournamentTeamCreateSchema.safeParse(body);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    const orgId = await getTournamentOrgId(parsed.data.tournamentId);
    if (!orgId) {
      return NextResponse.json(
        { error: "Torneo no encontrado" },
        { status: 404 },
      );
    }

    const auth = await requireApiOrgAccess(orgId);
    if (auth.error) {
      return auth.error;
    }

    // Límite del plan: equipos por torneo (402 = upsell)
    const check = await assertPlanLimit(orgId, "addTeamToTournament", {
      tournamentId: parsed.data.tournamentId,
    });
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: 402 });
    }

    // Crear la relación equipo-torneo
    const tournamentTeam = await db.tournamentTeam.create({
      data: parsed.data,
    });

    await avisarSiEsDeOtraLiga(parsed.data.teamId, parsed.data.tournamentId, orgId);

    return NextResponse.json(tournamentTeam, { status: 201 });
  } catch (error) {
    console.error("Error al crear la relación equipo-torneo:", error);
    return NextResponse.json(
      { error: "Error al crear la relación equipo-torneo" },
      { status: 500 },
    );
  }
}
