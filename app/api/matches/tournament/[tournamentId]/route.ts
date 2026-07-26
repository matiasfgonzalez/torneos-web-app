import { db } from "@/lib/db";
import { apiError, apiOk } from "@/lib/apiResponse";

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
          include: {
            team: true,
          },
        },
        awayTeam: {
          include: {
            team: true,
          },
        },
        tournamentPhase: true,
        goals: {
          include: {
            teamPlayer: {
              include: {
                player: true,
              },
            },
          },
        },
        cards: {
          include: {
            teamPlayer: {
              include: {
                player: true,
              },
            },
          },
        },
        referees: {
          include: {
            referee: true,
          },
        },
      },
      orderBy: { dateTime: "asc" },
    });

    return apiOk(matches);
  } catch (error) {
    console.error("Error fetching matches by tournament:", error);
    return apiError(500, "Error fetching matches by tournament");
  }
}
