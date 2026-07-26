// app/api/noticias/[id]/route.ts
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { validateApiRole } from "@/lib/apiRoleValidation";
import { newsUpdateSchema } from "@/lib/validators/news";
import { validationErrorResponse } from "@/lib/validators/common";
import { newsAuthorSelect } from "@modules/noticias/authorSelect";
import { safeDeleteAssets } from "@/lib/cloudinary";
import { extractPublicId } from "@/lib/cloudinary-orphans";
import { apiError, apiNoContent, apiOk } from "@/lib/apiResponse";

type tParams = Promise<{ id: string }>;

export async function GET(req: NextRequest, { params }: { params: tParams }) {
  try {
    const { id } = await params;

    if (!id) {
      return apiError(400, "ID no proporcionado");
    }

    const noticia = await db.news.findUnique({
      where: { id },
      include: {
        user: newsAuthorSelect, // autor sin PII (M1) — GET público
      },
    });

    if (!noticia) {
      return apiError(404, "Noticia no encontrada");
    }

    return apiOk(noticia);
  } catch (error) {
    console.error("Error al obtener noticia por ID:", error);
    return apiError(500, "Error interno del servidor");
  }
}

export async function PUT(req: NextRequest, { params }: { params: tParams }) {
  try {
    // Await params before accessing its properties
    const { id } = await params;
    const body = await req.json();

    if (!id) {
      return apiError(400, "ID no proporcionado");
    }

    // Noticias globales de la plataforma: solo ADMINISTRADOR (decisión D5)
    const authResult = await validateApiRole(["ADMINISTRADOR"]);
    if (authResult.error) {
      return authResult.error;
    }

    const parsed = newsUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    // A6: `publishedAt` se fija la PRIMERA vez que se publica y se conserva
    // (no se re-sella al editar ni se borra al pasar a borrador) — mismo patrón
    // que `OrgPost`. El PUT es parcial: el estado efectivo puede venir del body
    // o quedarse como estaba.
    const existing = await db.news.findUnique({
      where: { id },
      select: { published: true, publishedAt: true },
    });
    if (!existing) {
      return apiError(404, "Noticia no encontrada");
    }
    const willPublish = parsed.data.published ?? existing.published;
    const publishedAt = willPublish
      ? (existing.publishedAt ?? new Date())
      : existing.publishedAt;

    const updatedNoticia = await db.news.update({
      where: { id },
      data: { ...parsed.data, publishedAt },
      include: { user: newsAuthorSelect },
    });

    return apiOk(updatedNoticia);
  } catch (error) {
    console.error("Error al actualizar la noticia:", error);
    return apiError(500, "Error al actualizar la noticia");
  }
}

// DELETE: Eliminar una noticia por ID
export async function DELETE(
  req: NextRequest,
  { params }: { params: tParams },
) {
  try {
    // Await params before accessing its properties
    const { id } = await params;

    if (!id) {
      return apiError(400, "ID no proporcionado");
    }

    // Noticias globales de la plataforma: solo ADMINISTRADOR (decisión D5)
    const authResult = await validateApiRole(["ADMINISTRADOR"]);
    if (authResult.error) {
      return authResult.error;
    }

    const deletedNoticia = await db.news.delete({
      where: { id },
    });

    // Prevención de huérfanos (M9): la noticia se borra físicamente, así que su
    // portada ya no la referencia nadie. Best-effort — si Cloudinary falla, el
    // borrado de la noticia igual es válido y el panel de huérfanos la limpia.
    await safeDeleteAssets([
      deletedNoticia.coverImagePublicId,
      extractPublicId(deletedNoticia.coverImageUrl),
    ]);

    // A7: 204. El `{ message, deletedNoticia }` que devolvía no lo leía nadie.
    return apiNoContent();
  } catch (error) {
    console.error("Error al eliminar la noticia:", error);
    return apiError(500, "Error al eliminar la noticia");
  }
}
