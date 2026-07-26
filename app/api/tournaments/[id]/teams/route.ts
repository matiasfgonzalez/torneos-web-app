import { db } from "@/lib/db";
import { apiError, apiOk } from "@/lib/apiResponse";

type tParams = Promise<{ id: string }>;

export async function GET(req: Request, { params }: { params: tParams }) {
  try {
    const { id } = await params;

    const teams = await db.tournamentTeam.findMany({
      where: { tournamentId: id },
      include: { team: true },
    });

    return apiOk(teams);
  } catch (error) {
    console.error("Error listando equipos:", error);
    return apiError(500, "Error interno del servidor");
  }
}
