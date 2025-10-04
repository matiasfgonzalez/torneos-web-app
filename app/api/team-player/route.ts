import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    // 🔹 auth y currentUser en paralelo
    const [{ userId }, userLogued] = await Promise.all([auth(), currentUser()]);

    if (!userId) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no registrado en la base de datos" },
        { status: 404 }
      );
    }

    const role = userLogued?.publicMetadata?.role as string | null;

    if (role !== "admin") {
      return NextResponse.json(
        { error: "No tienes permisos para actualizar el partido" },
        { status: 403 }
      );
    }

    const body = await req.json();

    const teamPlayer = await db.teamPlayer.create({
      data: {
        ...body,
        joinedAt: new Date(body.joinedAt),
        leftAt: body.leftAt ? new Date(body.leftAt) : null,
      },
    });

    return NextResponse.json(teamPlayer, { status: 201 });
  } catch (error) {
    console.error("Error al crear la relación equipo-jugador:", error);
    return NextResponse.json(
      { error: "Error al crear la relación equipo-jugador" },
      { status: 500 }
    );
  }
}
