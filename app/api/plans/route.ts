import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apiError } from "@/lib/apiResponse";

// GET /api/plans — planes activos (público: pricing y página de plan)
export async function GET() {
  try {
    const plans = await db.plan.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      select: {
        id: true,
        code: true,
        name: true,
        priceMonthly: true,
        currency: true,
        maxActiveTournaments: true,
        maxTeamsPerTournament: true,
        maxMembers: true,
        features: true,
      },
    });

    return NextResponse.json(plans);
  } catch (error) {
    console.error("Error al obtener planes:", error);
    return apiError(500, "Error al obtener los planes");
  }
}
