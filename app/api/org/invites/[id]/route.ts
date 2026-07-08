import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";
import { checkUser } from "@/lib/checkUser";
import { isOrgOwner } from "@/lib/orgAuth";
import { apiError } from "@/lib/apiResponse";

type tParams = Promise<{ id: string }>;

/**
 * DELETE /api/org/invites/[id] — cancelar una invitación pendiente.
 * Solo OWNER (o admin). Libera el cupo de maxMembers.
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

    const invite = await db.organizationInvite.findUnique({
      where: { id },
    });
    if (!invite) {
      return apiError(404, "Invitación no encontrada");
    }

    if (!(await isOrgOwner(user, invite.organizationId))) {
      return apiError(403, "Solo el dueño de la liga puede cancelar invitaciones");
    }

    if (invite.status !== "PENDIENTE") {
      return apiError(400, "La invitación ya fue aceptada o cancelada");
    }

    await db.organizationInvite.update({
      where: { id },
      data: { status: "CANCELADA" },
    });

    return NextResponse.json({ message: "Invitación cancelada" });
  } catch (error) {
    console.error("Error al cancelar invitación:", error);
    return apiError(500, "Error al cancelar la invitación");
  }
}
