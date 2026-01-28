// app/api/teams/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateApiRole } from "@/lib/apiRoleValidation";

export async function POST(req: Request) {
  // Validate that only ADMINISTRADOR, EDITOR or ORGANIZADOR can create teams
  const authResult = await validateApiRole(["ADMINISTRADOR", "EDITOR", "ORGANIZADOR"]);
  if (authResult.error) {
    return authResult.error;
  }

  try {
    const body = await req.json();
    const yearFounded = Number(body.yearFounded);
    const currentYear = new Date().getFullYear();

    if (isNaN(yearFounded)) {
      return NextResponse.json(
        { error: "El año de fundación debe ser un número válido." },
        { status: 400 },
      );
    }

    if (yearFounded < 1900 || yearFounded > currentYear) {
      return NextResponse.json(
        { error: `El año debe estar entre 1900 y ${currentYear}.` },
        { status: 400 },
      );
    }

    // --- Fin de la validación ---

    const newTournament = await db.team.create({
      data: {
        name: body.name,
        shortName: body.shortName,
        description: body.description,
        history: body.history,
        coach: body.coach,
        homeCity: body.homeCity,
        yearFounded: body.yearFounded,
        homeColor: body.homeColor,
        awayColor: body.awayColor,
        logoUrl: body.logoUrl,
      },
    });

    return NextResponse.json(newTournament, { status: 201 });
  } catch (error) {
    console.error(error);
    return new NextResponse("Error al crear el torneo", { status: 500 });
  }
}
