import { NextRequest, NextResponse } from "next/server";
import { checkUser } from "@/lib/checkUser";
import { db } from "@/lib/db";

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

    // Validar que el user sea admin
    const userLogued = await checkUser();
    if (!userLogued) {
      return NextResponse.json(
        { error: "Usuario no autenticado" },
        { status: 401 },
      );
    }

    if (userLogued.role !== "ADMINISTRADOR") {
      return NextResponse.json(
        { error: "No tienes permisos para eliminar un torneo" },
        { status: 403 },
      );
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

    const userLogued = await checkUser();
    if (!userLogued) {
      return NextResponse.json(
        { error: "Usuario no autenticado" },
        { status: 401 },
      );
    }

    if (userLogued.role !== "ADMINISTRADOR") {
      return NextResponse.json(
        { error: "No tienes permisos para editar un torneo" },
        { status: 403 },
      );
    }

    const startDate = new Date(body.startDate + "T00:00:00");
    const endDate = body.endDate ? new Date(body.endDate + "T00:00:00") : null;
    const nextMatch = body.nextMatch ? new Date(body.nextMatch) : null;

    if (startDate && isNaN(startDate.getTime())) {
      return NextResponse.json(
        { error: "Fecha de inicio inválida" },
        { status: 400 },
      );
    }

    const updatedTournament = await db.tournament.update({
      where: { id },
      data: {
        startDate,
        endDate,
        nextMatch,
        name: body.name,
        description: body.description,
        category: body.category,
        locality: body.locality,
        logoUrl: body.logoUrl,
        liga: body.liga,
        format: body.format,
        homeAndAway: body.homeAndAway,
        status: body.status,
        enabled: body.enabled,
        rules: body.rules || null,
        trophy: body.trophy || null,
      },
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
