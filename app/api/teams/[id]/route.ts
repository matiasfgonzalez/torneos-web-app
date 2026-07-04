// app/api/teams/[id]/route.ts
import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";
import { validateApiRole } from "@/lib/apiRoleValidation";
import { teamUpdateSchema } from "@/lib/validators/team";
import { validationErrorResponse } from "@/lib/validators/common";

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

    const parsed = teamUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    const updatedTournament = await db.team.update({
      where: { id },
      data: parsed.data,
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
