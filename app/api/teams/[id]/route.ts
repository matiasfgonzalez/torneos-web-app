// app/api/teams/[id]/route.ts
import { NextResponse, NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { validateApiRole } from "@/lib/apiRoleValidation";

type tParams = Promise<{ id: string }>;

export async function PATCH(req: NextRequest, { params }: { params: tParams }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "ID no proporcionado" },
        { status: 400 },
      );
    }

    // Validate that only ADMINISTRADOR, EDITOR or ORGANIZADOR can update teams
    const authResult = await validateApiRole(["ADMINISTRADOR", "EDITOR", "ORGANIZADOR"]);
    if (authResult.error) {
      return authResult.error;
    }

    const body = await req.json();

    // Validación opcional del año
    if (body.yearFounded !== undefined) {
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
          {
            error: `El año debe estar entre 1900 y ${currentYear}.`,
          },
          { status: 400 },
        );
      }
    }

    const updatedTournament = await db.team.update({
      where: { id },
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
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedTournament, { status: 200 });
  } catch (error) {
    console.error("Error en PATCH /api/tournaments:", error);
    return NextResponse.json(
      { error: "Error al actualizar el torneo" },
      { status: 500 },
    );
  }
}
