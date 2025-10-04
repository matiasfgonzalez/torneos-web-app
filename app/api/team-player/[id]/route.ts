import { NextResponse } from "next/server";
import { db } from "@/lib/db";

type tParams = Promise<{ id: string }>;

export async function GET(req: Request, { params }: { params: tParams }) {
  const { id } = await params;

  try {
    const players = await db.teamPlayer.findMany({
      where: {
        tournamentTeamId: id,
      },
      include: {
        player: true,
      },
      orderBy: { joinedAt: "asc" },
    });

    return NextResponse.json(players, { status: 200 });
  } catch (error) {
    console.error("Error al obtener los jugadores asociados: ", error);
    return NextResponse.json(
      { error: "Error al obtener los jugadores asociados:" },
      { status: 500 }
    );
  }
}
