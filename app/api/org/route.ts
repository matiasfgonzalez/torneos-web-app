import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkUser } from "@/lib/checkUser";
import { getOrCreateOwnOrg, isOrgOwner, uniqueSlug } from "@/lib/orgAuth";
import { apiError } from "@/lib/apiResponse";
import { organizationUpdateSchema } from "@/lib/validators/organization";
import { validationErrorResponse } from "@/lib/validators/common";

/**
 * GET /api/org — organización del usuario (perfil + su rol en ella).
 * La crea en su primer uso (freemium D7).
 */
export async function GET() {
  try {
    const user = await checkUser();
    if (!user) {
      return apiError(401, "Debes iniciar sesión");
    }

    const org = await getOrCreateOwnOrg(user);

    const membership = await db.organizationMember.findUnique({
      where: {
        organizationId_userId: { organizationId: org.id, userId: user.id },
      },
      select: { role: true },
    });

    return NextResponse.json({
      id: org.id,
      name: org.name,
      slug: org.slug,
      logoUrl: org.logoUrl,
      logoPublicId: org.logoPublicId,
      brandColor: org.brandColor,
      description: org.description,
      locality: org.locality,
      phone: org.phone,
      status: org.status,
      // ADMINISTRADOR sin membresía opera como OWNER
      myRole: membership?.role ?? (user.role === "ADMINISTRADOR" ? "OWNER" : null),
    });
  } catch (error) {
    console.error("Error al obtener la organización:", error);
    return apiError(500, "Error al obtener la organización");
  }
}

/**
 * PATCH /api/org — actualizar el perfil de la liga (solo OWNER o admin).
 * Si cambia el nombre se regenera el slug (las URLs públicas por slug
 * llegan con N9; hasta entonces el cambio es seguro).
 */
export async function PATCH(req: Request) {
  try {
    const user = await checkUser();
    if (!user) {
      return apiError(401, "Debes iniciar sesión");
    }

    const org = await getOrCreateOwnOrg(user);

    if (!(await isOrgOwner(user, org.id))) {
      return apiError(403, "Solo el dueño de la liga puede editar su perfil");
    }

    const body = await req.json();
    const parsed = organizationUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    const data: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.name && parsed.data.name !== org.name) {
      data.slug = await uniqueSlug(parsed.data.name, org.id);
    }

    const updated = await db.organization.update({
      where: { id: org.id },
      data,
    });

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      slug: updated.slug,
      logoUrl: updated.logoUrl,
      logoPublicId: updated.logoPublicId,
      brandColor: updated.brandColor,
      description: updated.description,
      locality: updated.locality,
      phone: updated.phone,
      status: updated.status,
    });
  } catch (error) {
    console.error("Error al actualizar la organización:", error);
    return apiError(500, "Error al actualizar la organización");
  }
}
