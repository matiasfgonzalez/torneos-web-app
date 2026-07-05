// app/api/tournaments/route.ts
import { Prisma, TournamentCategory } from "@prisma/client";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateApiRole } from "@/lib/apiRoleValidation";
import { apiError } from "@/lib/apiResponse";
import { tournamentCreateSchema } from "@/lib/validators/tournament";
import { validationErrorResponse } from "@/lib/validators/common";

export async function POST(req: Request) {
  // Validate that only ADMINISTRADOR, EDITOR or ORGANIZADOR can create tournaments
  const authResult = await validateApiRole(["ADMINISTRADOR", "EDITOR", "ORGANIZADOR"]);
  if (authResult.error) {
    return authResult.error;
  }

  try {
    const body = await req.json();

    const parsed = tournamentCreateSchema.safeParse(body);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    const newTournament = await db.tournament.create({
      data: {
        ...parsed.data,
        status: "PENDIENTE",
        userId: authResult.user!.id,
      },
    });

    return NextResponse.json(newTournament, { status: 201 });
  } catch (error) {
    console.error(error);
    return apiError(500, "Error al crear el torneo");
  }
}

export async function GET(req: Request) {
  try {
    // Obtener los parámetros de búsqueda de la URL
    const url = new URL(req.url);
    const category = url.searchParams.get("category");
    const liga = url.searchParams.get("liga");

    // Construir el objeto de consulta para Prisma
    const query: Prisma.TournamentWhereInput = { deletedAt: null };
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

    // Lista vacía devuelve [] (convención A7): el cliente siempre recibe array
    return NextResponse.json(tournaments, { status: 200 });
  } catch (error) {
    console.error(error);
    return apiError(500, "Error al obtener los torneos");
  }
}
