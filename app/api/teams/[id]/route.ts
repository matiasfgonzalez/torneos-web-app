// app/api/teams/[id]/route.ts
import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";
import { checkUser } from "@/lib/checkUser";
import { canManageOrg } from "@/lib/orgAuth";
import { canManageTeam } from "@/lib/teamAuth";
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

    // Dos caminos válidos y distintos (los dos ejes de permisos de N13):
    // el **staff de la liga** por su membresía, y el **delegado aprobado** del
    // equipo, que no es miembro de la organización y por eso no pasa por
    // `orgAuth`. Los campos que acepta `teamUpdateSchema` son todos de
    // identidad/presentación del club (nombre, escudo, colores, entrenador…):
    // `enabled`, `deletedAt` y `organizationId` no están en el esquema, así que
    // habilitar al delegado no le abre nada administrativo de la liga.
    const user = await checkUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const allowed =
      (await canManageTeam(user, id)) ||
      (await canManageOrg(user, existing.organizationId));

    if (!allowed) {
      return NextResponse.json(
        { error: "No tenés permisos para editar este equipo" },
        { status: 403 },
      );
    }

    const body = await req.json();

    const parsed = teamUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    const updatedTeam = await db.team.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json(updatedTeam, { status: 200 });
  } catch (error) {
    console.error("Error en PATCH /api/teams/[id]:", error);
    return NextResponse.json(
      { error: "Error al actualizar el equipo" },
      { status: 500 },
    );
  }
}
