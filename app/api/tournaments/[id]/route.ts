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

    const existing = await db.tournament.findUnique({
      where: { id },
      select: { id: true, deletedAt: true },
    });

    if (!existing || existing.deletedAt) {
      return NextResponse.json(
        { error: "Torneo no encontrado" },
        { status: 404 },
      );
    }

    // Soft delete: conserva partidos, goles, tarjetas y standings (recuperable)
    const deletedTournament = await db.tournament.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        enabled: false,
      },
    });

    return NextResponse.json(
      { message: "Torneo eliminado correctamente", deletedTournament },
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

    const existing = await db.tournament.findUnique({
      where: { id },
      select: { deletedAt: true },
    });

    if (!existing || existing.deletedAt) {
      return NextResponse.json(
        { error: "Torneo no encontrado" },
        { status: 404 },
      );
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
