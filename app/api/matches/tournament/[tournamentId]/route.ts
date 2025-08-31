import { NextResponse } from "next/server";
import { db } from "@/lib/db";

type tParams = Promise<{ tournamentId: string }>;

// GET /api/matches/tournament/:tournamentId
export async function GET(_req: Request, { params }: { params: tParams }) {
  const { tournamentId } = await params;

  try {
    const matches = await db.match.findMany({
      where: {
        tournamentId: tournamentId,
      },
      include: {
        tournament: true,
        homeTeam: {
          include: { team: true },
        },
        awayTeam: {
          include: { team: true },
        },
        phase: true,
        goals: {
          include: {
            player: true,
          },
        },
      },
      orderBy: { dateTime: "asc" },
    });

    return NextResponse.json(matches, { status: 200 });
  } catch (error) {
    console.error("Error fetching matches by tournament:", error);
    return NextResponse.json(
      { error: "Error fetching matches by tournament" },
      { status: 500 }
    );
  }
}
