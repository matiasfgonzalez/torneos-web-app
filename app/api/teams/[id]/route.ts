// app/api/teams/[id]/route.ts
import { NextResponse, NextRequest } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

type tParams = Promise<{ id: string }>;

export async function PATCH(req: NextRequest, { params }: { params: tParams }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "ID no proporcionado" },
        { status: 400 }
      );
    }

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no registrado en la base de datos" },
        { status: 404 }
      );
    }

    const userLogued = await currentUser();
    const role = userLogued?.publicMetadata?.role as string | null;

    if (role !== "admin") {
      return NextResponse.json(
        { error: "No tienes permisos para actualizar el torneo" },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Validación opcional del año
    if (body.yearFounded !== undefined) {
      const yearFounded = Number(body.yearFounded);
      const currentYear = new Date().getFullYear();

      if (isNaN(yearFounded)) {
        return NextResponse.json(
          { error: "El año de fundación debe ser un número válido." },
          { status: 400 }
        );
      }

      if (yearFounded < 1900 || yearFounded > currentYear) {
        return NextResponse.json(
          {
            error: `El año debe estar entre 1900 y ${currentYear}.`,
          },
          { status: 400 }
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
        tournamentId: body.tournamentId,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedTournament, { status: 200 });
  } catch (error) {
    console.error("Error en PATCH /api/tournaments:", error);
    return NextResponse.json(
      { error: "Error al actualizar el torneo" },
      { status: 500 }
    );
  }
}
