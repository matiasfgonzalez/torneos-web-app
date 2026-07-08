import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";
import { checkUser } from "@/lib/checkUser";
import { isOrgOwner } from "@/lib/orgAuth";
import { apiError } from "@/lib/apiResponse";
import { memberRoleSchema } from "@/lib/validators/organization";
import { validationErrorResponse } from "@/lib/validators/common";

type tParams = Promise<{ id: string }>;

/**
 * PATCH /api/org/members/[id] — cambiar rol ORGANIZADOR ↔ COLABORADOR.
 * Solo OWNER (o admin). El rol OWNER no se toca por acá.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: tParams },
) {
  try {
    const { id } = await params;

    const user = await checkUser();
    if (!user) {
      return apiError(401, "Debes iniciar sesión");
    }

    const member = await db.organizationMember.findUnique({
      where: { id },
    });
    if (!member) {
      return apiError(404, "Miembro no encontrado");
    }

    if (!(await isOrgOwner(user, member.organizationId))) {
      return apiError(403, "Solo el dueño de la liga puede cambiar roles");
    }

    if (member.role === "OWNER") {
      return apiError(400, "El rol del dueño de la liga no se puede cambiar");
    }

    const body = await req.json();
    const parsed = memberRoleSchema.safeParse(body);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    const updated = await db.organizationMember.update({
      where: { id },
      data: { role: parsed.data.role },
      include: {
        user: {
          select: { id: true, name: true, email: true, imageUrl: true },
        },
      },
    });

    return NextResponse.json({
      id: updated.id,
      role: updated.role,
      createdAt: updated.createdAt,
      user: updated.user,
    });
  } catch (error) {
    console.error("Error al cambiar rol de miembro:", error);
    return apiError(500, "Error al cambiar el rol del miembro");
  }
}

/**
 * DELETE /api/org/members/[id] — quitar un miembro de la liga.
 * Solo OWNER (o admin). El OWNER no se puede quitar a sí mismo.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: tParams },
) {
  try {
    const { id } = await params;

    const user = await checkUser();
    if (!user) {
      return apiError(401, "Debes iniciar sesión");
    }

    const member = await db.organizationMember.findUnique({
      where: { id },
    });
    if (!member) {
      return apiError(404, "Miembro no encontrado");
    }

    if (!(await isOrgOwner(user, member.organizationId))) {
      return apiError(403, "Solo el dueño de la liga puede quitar miembros");
    }

    if (member.role === "OWNER") {
      return apiError(400, "El dueño de la liga no se puede quitar");
    }

    await db.organizationMember.delete({ where: { id } });

    return NextResponse.json({ message: "Miembro quitado de la liga" });
  } catch (error) {
    console.error("Error al quitar miembro:", error);
    return apiError(500, "Error al quitar al miembro");
  }
}
