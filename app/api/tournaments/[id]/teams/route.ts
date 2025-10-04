import { NextResponse } from "next/server";
import { db } from "@/lib/db";

type tParams = Promise<{ id: string }>;

export async function GET(req: Request, { params }: { params: tParams }) {
  try {
    const { id } = await params;

    const teams = await db.tournamentTeam.findMany({
      where: { tournamentId: id },
      include: { team: true },
    });

    return NextResponse.json(teams);
  } catch (error) {
    console.error("Error listando equipos:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
