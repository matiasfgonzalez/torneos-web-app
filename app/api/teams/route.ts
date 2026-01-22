// app/api/tournaments/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 400 },
      );
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    // Check if user exists
    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 },
      );
    }

    // Validar que el user sea admin
    if (user.role !== "ADMINISTRADOR") {
      return NextResponse.json(
        { error: "No tienes permisos para crear un equipo" },
        { status: 403 },
      );
    }

    // --- Validación de 'yearFounded' ---
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
