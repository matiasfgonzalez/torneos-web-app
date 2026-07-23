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
      select: {
        tournamentId: true,
        tournament: { select: { organizationId: true } },
      },
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

    // M11: un jugador no puede estar en dos equipos del **mismo torneo** (juega
    // para uno solo). El `@@unique([playerId, tournamentTeamId])` solo evita
    // repetirlo en el mismo equipo; esto cubre el caso de otro equipo del torneo.
    const dup = await db.teamPlayer.findFirst({
      where: {
        playerId: parsed.data.playerId,
        tournamentTeamId: { not: parsed.data.tournamentTeamId },
        tournamentTeam: { tournamentId: tournamentTeam.tournamentId },
      },
      select: { tournamentTeam: { select: { team: { select: { name: true } } } } },
    });
    if (dup) {
      return NextResponse.json(
        {
          error: `Ese jugador ya está en ${dup.tournamentTeam.team.name} en este torneo. Un jugador juega para un solo equipo por torneo.`,
        },
        { status: 409 },
      );
    }

    // Mismo equipo repetido (el `@@unique`): se traduce el P2002 de Prisma a un
    // mensaje claro en vez de un 500.
    const already = await db.teamPlayer.findUnique({
      where: {
        playerId_tournamentTeamId: {
          playerId: parsed.data.playerId,
          tournamentTeamId: parsed.data.tournamentTeamId,
        },
      },
      select: { id: true },
    });
    if (already) {
      return NextResponse.json(
        { error: "El jugador ya está en la lista de este equipo." },
        { status: 409 },
      );
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
