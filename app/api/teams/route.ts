// app/api/teams/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateApiRole } from "@/lib/apiRoleValidation";
import { apiError } from "@/lib/apiResponse";
import { teamCreateSchema } from "@/lib/validators/team";
import { validationErrorResponse } from "@/lib/validators/common";

export async function POST(req: Request) {
  // Validate that only ADMINISTRADOR, EDITOR or ORGANIZADOR can create teams
  const authResult = await validateApiRole(["ADMINISTRADOR", "EDITOR", "ORGANIZADOR"]);
  if (authResult.error) {
    return authResult.error;
  }

  try {
    const body = await req.json();

    const parsed = teamCreateSchema.safeParse(body);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    const newTournament = await db.team.create({
      data: parsed.data,
    });

    return NextResponse.json(newTournament, { status: 201 });
  } catch (error) {
    console.error(error);
    return apiError(500, "Error al crear el equipo");
  }
}
