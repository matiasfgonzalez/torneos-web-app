// app/api/teams/[id]/route.ts
import { NextResponse, NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

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

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no registrado en la base de datos" },
        { status: 404 },
      );
    }

    if (user.role !== "ADMINISTRADOR") {
      return NextResponse.json(
        { error: "No tienes permisos para actualizar el jugador" },
        { status: 403 },
      );
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
