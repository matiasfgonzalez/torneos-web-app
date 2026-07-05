// app/api/teams/[id]/route.ts
import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireApiOrgAccess } from "@/lib/orgAuth";
import { teamUpdateSchema } from "@/lib/validators/team";
import { validationErrorResponse } from "@/lib/validators/common";

type tParams = Promise<{ id: string }>;

export async function PATCH(req: NextRequest, { params }: { params: tParams }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "ID no proporcionado" },
        { status: 400 },
      );
    }

    const existing = await db.team.findUnique({
      where: { id },
      select: { organizationId: true, deletedAt: true },
    });

    if (!existing || existing.deletedAt) {
      return NextResponse.json(
        { error: "Equipo no encontrado" },
        { status: 404 },
      );
    }

    const auth = await requireApiOrgAccess(existing.organizationId);
    if (auth.error) {
      return auth.error;
    }

    const body = await req.json();

    const parsed = teamUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    const updatedTournament = await db.team.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json(updatedTournament, { status: 200 });
  } catch (error) {
    console.error("Error en PATCH /api/tournaments:", error);
    return NextResponse.json(
      { error: "Error al actualizar el torneo" },
      { status: 500 },
    );
  }
}
