// app/api/players/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiOrgContext } from "@/lib/orgAuth";
import { apiError } from "@/lib/apiResponse";
import { playerCreateSchema } from "@/lib/validators/player";
import { validationErrorResponse } from "@/lib/validators/common";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const auth = await requireApiOrgContext();
    if (auth.error) {
      return auth.error;
    }

    const parsed = playerCreateSchema.safeParse(body);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    const newPlayer = await db.player.create({
      data: {
        ...parsed.data,
        organizationId: auth.org.id,
      },
    });

    return NextResponse.json(newPlayer, { status: 201 });
  } catch (error) {
    console.error(error);
    return apiError(500, "Error al crear el jugador");
  }
}

export async function GET() {
  try {
    const players = await db.player.findMany();
    return NextResponse.json(players);
  } catch (error) {
    console.error(error);
    return apiError(500, "Error obteniendo jugadores");
  }
}
