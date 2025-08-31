// app/api/phases/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const phases = await db.phase.findMany({
      orderBy: {
        order: "asc", // Opcional: ordenarlas por el campo 'order'
      },
    });

    return NextResponse.json(phases, { status: 200 });
  } catch (error) {
    console.error("Error fetching phases:", error);
    return NextResponse.json(
      { error: "No se pudieron obtener las fases" },
      { status: 500 }
    );
  }
}
