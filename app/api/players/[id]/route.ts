// app/api/teams/[id]/route.ts
import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";
import { validateApiRole } from "@/lib/apiRoleValidation";

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

    // Validate that only ADMINISTRADOR, EDITOR or ORGANIZADOR can update players
    const authResult = await validateApiRole(["ADMINISTRADOR", "EDITOR", "ORGANIZADOR"]);
    if (authResult.error) {
      return authResult.error;
    }

    const body = await req.json();

    const updatedPlayer = await db.player.update({
      where: { id },
      data: {
        ...body,
        birthDate: new Date(body.birthDate),
        joinedAt: new Date(body.joinedAt),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedPlayer, { status: 200 });
  } catch (error) {
    console.error("Error en PATCH /api/players:", error);
    return NextResponse.json(
      { error: "Error al actualizar el jugador" },
      { status: 500 },
    );
  }
}
