// app/api/players/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateApiRole } from "@/lib/apiRoleValidation";

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
      imagePublicId,
      imageUrlFace,
      imageFacePublicId,
      instagramUrl,
      twitterUrl,
      description,
      bio,
    } = body;

    // Validate that only ADMINISTRADOR, EDITOR or ORGANIZADOR can create players
    const authResult = await validateApiRole(["ADMINISTRADOR", "EDITOR", "ORGANIZADOR"]);
    if (authResult.error) {
      return authResult.error;
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
        imagePublicId,
        imageUrlFace,
        imageFacePublicId,
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
