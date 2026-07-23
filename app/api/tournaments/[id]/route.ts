import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiOrgAccess, requireApiOrgOwner } from "@/lib/orgAuth";
import { assertPlanLimit, isActiveTournamentStatus } from "@/lib/planLimits";
import { uniqueTournamentSlug } from "@/lib/slug";
import { tournamentUpdateSchema } from "@/lib/validators/tournament";
import { validationErrorResponse } from "@/lib/validators/common";

type tParams = Promise<{ id: string }>;

/**
 * GET /api/tournaments/[id] — torneo + equipos inscriptos + fases (F3).
 *
 * Lo consume el formulario de partido cuando se lo abre desde `/admin/partidos`,
 * donde no hay un torneo en contexto: al elegir el torneo hay que traer SUS
 * equipos (TournamentTeam, que es lo que referencian `homeTeamId`/`awayTeamId`)
 * y sus fases. El diálogo viejo pedía `GET /api/teams` —una ruta que no existe
 * (solo exporta POST)— y además mandaba ids de `Team`, no de `TournamentTeam`:
 * programar un partido desde esa pantalla nunca funcionó.
 */
export async function GET(req: NextRequest, { params }: { params: tParams }) {
  try {
    const { id } = await params;

    const tournament = await db.tournament.findFirst({
      where: { id, deletedAt: null },
      include: {
        tournamentTeams: {
          include: {
            team: { select: { id: true, name: true, shortName: true, logoUrl: true } },
          },
        },
        tournamentPhases: { orderBy: { order: "asc" } },
      },
    });

    if (!tournament) {
      return NextResponse.json(
        { error: "Torneo no encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json(tournament, { status: 200 });
  } catch (error) {
    console.error("Error al obtener el torneo:", error);
    return NextResponse.json(
      { error: "Error al obtener el torneo" },
      { status: 500 },
    );
  }
}

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

    // Solo el OWNER (o admin) elimina torneos (D12/N14c): la baja libera cupo
    // del plan y es la mitad del truco eliminar→crear→restaurar (N4b).
    const auth = await requireApiOrgOwner(
      existing.organizationId,
      "Solo el dueño de la liga puede eliminar torneos",
    );
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
        status: true,
        startDate: true,
        endDate: true,
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

    // **Reactivar consume el límite igual que crear.** Faltaba: se podía
    // archivar un torneo (deja de contar), crear uno nuevo con el cupo libre y
    // después devolver el archivado a ACTIVO — quedando con más torneos activos
    // de los que permite el plan, sin pasar nunca por el chequeo.
    const wasActive = isActiveTournamentStatus(existing.status);
    const willBeActive = parsed.data.status
      ? isActiveTournamentStatus(parsed.data.status)
      : wasActive;

    if (willBeActive && !wasActive) {
      // Reactivar consume cupo igual que crear → también es del OWNER (D12).
      const ownerAuth = await requireApiOrgOwner(
        existing.organizationId,
        "Solo el dueño de la liga puede reactivar un torneo",
      );
      if (ownerAuth.error) {
        return ownerAuth.error;
      }

      const check = await assertPlanLimit(
        existing.organizationId,
        "createTournament",
      );
      if (!check.ok) {
        return NextResponse.json({ error: check.error }, { status: 402 });
      }
    }

    // M11: la fecha de fin no puede caer antes de la de inicio, contra los
    // valores **efectivos** (por si el PATCH manda solo una de las dos). El Zod
    // ya lo cubre cuando llegan juntas; esto cierra la edición parcial.
    const effectiveStart = parsed.data.startDate ?? existing.startDate;
    const effectiveEnd =
      parsed.data.endDate !== undefined ? parsed.data.endDate : existing.endDate;
    if (effectiveStart && effectiveEnd && effectiveEnd < effectiveStart) {
      return NextResponse.json(
        { error: "La fecha de fin no puede ser anterior a la de inicio." },
        { status: 400 },
      );
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
