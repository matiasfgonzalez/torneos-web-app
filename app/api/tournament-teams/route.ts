// /app/api/tournament-teams/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getTournamentOrgId, requireApiOrgAccess } from "@/lib/orgAuth";
import { assertPlanLimit } from "@/lib/planLimits";
import { tournamentTeamCreateSchema } from "@/lib/validators/tournament-team";
import { validationErrorResponse } from "@/lib/validators/common";

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

    return NextResponse.json(tournamentTeam, { status: 201 });
  } catch (error) {
    console.error("Error al crear la relación equipo-torneo:", error);
    return NextResponse.json(
      { error: "Error al crear la relación equipo-torneo" },
      { status: 500 },
    );
  }
}
