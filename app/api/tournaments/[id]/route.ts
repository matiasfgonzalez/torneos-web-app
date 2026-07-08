import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiOrgAccess } from "@/lib/orgAuth";
import { uniqueTournamentSlug } from "@/lib/slug";
import { tournamentUpdateSchema } from "@/lib/validators/tournament";
import { validationErrorResponse } from "@/lib/validators/common";

type tParams = Promise<{ id: string }>;

export async function DELETE(
  req: NextRequest,
  { params }: { params: tParams },
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "ID no proporcionado" },
        { status: 400 },
      );
    }

    const existing = await db.tournament.findUnique({
      where: { id },
      select: { id: true, deletedAt: true, organizationId: true },
    });

    if (!existing || existing.deletedAt) {
      return NextResponse.json(
        { error: "Torneo no encontrado" },
        { status: 404 },
      );
    }

    // Solo gestores de la organización dueña (o admin) pueden eliminar
    const auth = await requireApiOrgAccess(existing.organizationId);
    if (auth.error) {
      return auth.error;
    }

    // Soft delete: conserva partidos, goles, tarjetas y standings (recuperable)
    const deletedTournament = await db.tournament.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        enabled: false,
      },
    });

    return NextResponse.json(
      { message: "Torneo eliminado correctamente", deletedTournament },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error al eliminar el torneo:", error);
    return NextResponse.json(
      { error: "Error al eliminar el torneo" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest, { params }: { params: tParams }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "ID no proporcionado" },
        { status: 400 },
      );
    }

    const body = await req.json();

    const parsed = tournamentUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    const existing = await db.tournament.findUnique({
      where: { id },
      select: {
        deletedAt: true,
        organizationId: true,
        name: true,
        slug: true,
      },
    });

    if (!existing || existing.deletedAt) {
      return NextResponse.json(
        { error: "Torneo no encontrado" },
        { status: 404 },
      );
    }

    // Solo gestores de la organización dueña (o admin) pueden editar
    const auth = await requireApiOrgAccess(existing.organizationId);
    if (auth.error) {
      return auth.error;
    }

    // El slug se genera una sola vez y NO cambia al renombrar, para mantener
    // estables las URLs compartidas (WhatsApp/QR). Solo se completa si falta (N9).
    const data: Record<string, unknown> = { ...parsed.data };
    if (!existing.slug) {
      data.slug = await uniqueTournamentSlug(
        parsed.data.name ?? existing.name,
        existing.organizationId,
        id,
      );
    }

    const updatedTournament = await db.tournament.update({
      where: { id },
      data,
    });

    return NextResponse.json(
      { message: "Torneo actualizado correctamente", updatedTournament },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error al actualizar el torneo:", error);
    return NextResponse.json(
      { error: "Error al actualizar el torneo" },
      { status: 500 },
    );
  }
}
