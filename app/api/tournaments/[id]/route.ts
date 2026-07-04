import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateApiRole } from "@/lib/apiRoleValidation";
import { tournamentUpdateSchema } from "@/lib/validators/tournament";
import { validationErrorResponse } from "@/lib/validators/common";

type tParams = Promise<{ id: string }>;

export async function DELETE(
  req: NextRequest,
  { params }: { params: tParams },
) {
  try {
    console.log("Eliminando torneo con params:", params);
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "ID no proporcionado" },
        { status: 400 },
      );
    }

    // Validate that only ADMINISTRADOR, EDITOR or ORGANIZADOR can delete tournaments
    const authResult = await validateApiRole(["ADMINISTRADOR", "EDITOR", "ORGANIZADOR"]);
    if (authResult.error) {
      return authResult.error;
    }

    const deletedTournament = await db.tournament.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Torneo eliminada correctamente", deletedTournament },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error al eliminar el torneo:", error);
    return NextResponse.json(
      { error: "Error al eliminar el torneo" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest, { params }: { params: tParams }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "ID no proporcionado" },
        { status: 400 },
      );
    }

    const body = await req.json();

    // Validate that only ADMINISTRADOR, EDITOR or ORGANIZADOR can update tournaments
    const authResult = await validateApiRole(["ADMINISTRADOR", "EDITOR", "ORGANIZADOR"]);
    if (authResult.error) {
      return authResult.error;
    }

    const parsed = tournamentUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    const updatedTournament = await db.tournament.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json(
      { message: "Torneo actualizado correctamente", updatedTournament },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error al actualizar el torneo:", error);
    return NextResponse.json(
      { error: "Error al actualizar el torneo" },
      { status: 500 },
    );
  }
}
