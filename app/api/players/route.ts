// app/api/players/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      name,
      birthDate,
      birthPlace,
      nationality,
      height,
      weight,
      dominantFoot,
      position,
      number,
      status,
      joinedAt,
      imageUrl,
      imageUrlFace,
      instagramUrl,
      twitterUrl,
      description,
      bio,
    } = body;

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
        { error: "Usuario no encontrado" },
        { status: 404 },
      );
    }

    if (user.role !== "ADMINISTRADOR") {
      return NextResponse.json(
        { error: "No tienes permisos para crear un jugador" },
        { status: 403 },
      );
    }

    const newPlayer = await db.player.create({
      data: {
        name,
        birthDate: birthDate ? new Date(birthDate) : null,
        birthPlace,
        nationality,
        height: height ? parseFloat(height) : null,
        weight: weight ? parseFloat(weight) : null,
        dominantFoot,
        position,
        number: number ? parseInt(number) : null,
        imageUrl,
        imageUrlFace,
        description,
        bio,
        status,
        joinedAt: joinedAt ? new Date(joinedAt) : null,
        instagramUrl,
        twitterUrl,
      },
    });

    return NextResponse.json(newPlayer, { status: 201 });
  } catch (error) {
    console.error(error);
    return new NextResponse("Error al crear el jugador", { status: 500 });
  }
}

export async function GET() {
  try {
    const players = await db.player.findMany();
    return NextResponse.json(players);
  } catch (error) {
    console.error(error);
    return new NextResponse("Error obteniendo jugadores", { status: 500 });
  }
}
