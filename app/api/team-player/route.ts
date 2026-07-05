import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiOrgAccess } from "@/lib/orgAuth";
import { teamPlayerCreateSchema } from "@/lib/validators/team-player";
import { validationErrorResponse } from "@/lib/validators/common";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parsed = teamPlayerCreateSchema.safeParse(body);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    // La asociación pertenece al torneo del TournamentTeam → validar su org
    const tournamentTeam = await db.tournamentTeam.findUnique({
      where: { id: parsed.data.tournamentTeamId },
      select: { tournament: { select: { organizationId: true } } },
    });

    if (!tournamentTeam) {
      return NextResponse.json(
        { error: "El equipo del torneo no existe" },
        { status: 404 },
      );
    }

    const auth = await requireApiOrgAccess(
      tournamentTeam.tournament.organizationId,
    );
    if (auth.error) {
      return auth.error;
    }

    const teamPlayer = await db.teamPlayer.create({
      data: parsed.data,
    });

    return NextResponse.json(teamPlayer, { status: 201 });
  } catch (error) {
    console.error("Error al crear la relación equipo-jugador:", error);
    return NextResponse.json(
      { error: "Error al crear la relación equipo-jugador" },
      { status: 500 },
    );
  }
}
