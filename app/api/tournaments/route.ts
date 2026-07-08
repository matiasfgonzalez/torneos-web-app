// app/api/tournaments/route.ts
import { AgeGroup, Gender, Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiOrgContext } from "@/lib/orgAuth";
import { assertPlanLimit } from "@/lib/planLimits";
import { apiError } from "@/lib/apiResponse";
import { uniqueTournamentSlug } from "@/lib/slug";
import { tournamentCreateSchema } from "@/lib/validators/tournament";
import { validationErrorResponse } from "@/lib/validators/common";

export async function POST(req: Request) {
  // Cualquier usuario logueado crea torneos DENTRO de su organización
  // (se crea automáticamente en su primer uso — freemium D7)
  const auth = await requireApiOrgContext();
  if (auth.error) {
    return auth.error;
  }

  try {
    const body = await req.json();

    const parsed = tournamentCreateSchema.safeParse(body);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    // Límite del plan (402 = upsell)
    const check = await assertPlanLimit(auth.org.id, "createTournament");
    if (!check.ok) {
      return apiError(402, check.error);
    }

    // Slug público único por organización (N9)
    const slug = await uniqueTournamentSlug(parsed.data.name, auth.org.id);

    const newTournament = await db.tournament.create({
      data: {
        ...parsed.data,
        slug,
        status: "PENDIENTE",
        organizationId: auth.org.id,
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
    const ageGroup = url.searchParams.get("ageGroup");
    const gender = url.searchParams.get("gender");
    const liga = url.searchParams.get("liga");

    // Construir el objeto de consulta para Prisma
    const query: Prisma.TournamentWhereInput = { deletedAt: null };
    if (ageGroup && ageGroup in AgeGroup) {
      query.ageGroup = ageGroup as AgeGroup;
    }
    if (gender && gender in Gender) {
      query.gender = gender as Gender;
    }
    if (liga) {
      query.liga = liga;
    }

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
