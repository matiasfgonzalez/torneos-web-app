// app/api/tournaments/route.ts
import { Prisma, TournamentCategory } from "@prisma/client";
import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();

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

    // Check if user exists
    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Validar que el user sea admin
    const userLogued = await currentUser();
    if (!userLogued) {
      return NextResponse.json(
        { error: "Usuario no autenticado" },
        { status: 401 }
      );
    }
    const role = userLogued.publicMetadata?.role as string | null;
    if (role !== "admin") {
      return NextResponse.json(
        { error: "No tienes permisos para crear un torneo" },
        { status: 403 }
      );
    }

    const newTournament = await db.tournament.create({
      data: {
        name: body.name,
        description: body.description || null,
        category: body.category,
        locality: body.locality,
        logoUrl: body.logoUrl || null,
        liga: body.liga || null,
        status: "PENDIENTE",
        format: body.format,
        nextMatch: body.nextMatch ? new Date(body.nextMatch) : null,
        homeAndAway: body.homeAndAway ?? false,
        startDate: new Date(body.startDate),
        endDate: body.endDate ? new Date(body.endDate) : null,
        userId: user.id,
      },
    });

    return NextResponse.json(newTournament, { status: 201 });
  } catch (error) {
    console.error(error);
    return new NextResponse("Error al crear el torneo", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    // Obtener los parámetros de búsqueda de la URL
    const url = new URL(req.url);
    const category = url.searchParams.get("category");
    const liga = url.searchParams.get("liga");

    // Construir el objeto de consulta para Prisma
    const query: Prisma.TournamentWhereInput = {};
    if (category) {
      query.category = category as TournamentCategory;
    }
    if (liga) {
      query.liga = liga;
    }

    // Obtener la lista de torneos de la base de datos
    // Si se especifican parámetros, la consulta se filtra automáticamente.
    const tournaments = await db.tournament.findMany({
      include: {
        tournamentTeams: true,
      },
      where: query,
    });

    if (!tournaments || tournaments.length === 0) {
      return NextResponse.json(
        { message: "No se encontraron torneos." },
        { status: 200 } // Devuelve un 200 OK incluso si no hay resultados
      );
    }

    // Devolver la lista de torneos con un estado 200
    return NextResponse.json(tournaments, { status: 200 });
  } catch (error) {
    console.error(error);
    return new NextResponse("Error al obtener los torneos", { status: 500 });
  }
}
