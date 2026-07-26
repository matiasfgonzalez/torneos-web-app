/**
 * API Route: Eliminar imagen de Cloudinary
 * 
 * Este endpoint elimina una imagen de Cloudinary usando su public_id.
 * Requiere autenticación para evitar eliminaciones no autorizadas.
 * 
 * Método: DELETE
 * Body: { publicId: string }
 * Response: { result: "ok" | "not found" }
 */

import { deleteImage } from "@/lib/cloudinary";
import { deleteRequestSchema } from "@/types/cloudinary";
import { requireApiOrgContext } from "@/lib/orgAuth";
import { apiError, apiOk } from "@/lib/apiResponse";

export async function DELETE(request: Request) {
  try {
    // Solo gestores de una organización (o admin) pueden borrar imágenes
    const auth = await requireApiOrgContext();
    if (auth.error) {
      return auth.error;
    }

    // Parsear y validar el body
    const body = await request.json();
    const validationResult = deleteRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return apiError(400, "Datos inválidos", validationResult.error.issues);
    }

    const { publicId } = validationResult.data;

    // Eliminar la imagen de Cloudinary
    const result = await deleteImage(publicId);

    // Verificar el resultado
    if (result.result === "ok") {
      return apiOk({
        result: "ok",
        message: "Imagen eliminada correctamente",
      });
    } else if (result.result === "not found") {
      return apiOk({
        result: "not found",
        message: "La imagen no existe o ya fue eliminada",
      });
    } else {
      return apiOk({
        result: result.result,
        message: "Resultado inesperado al eliminar la imagen",
      });
    }
  } catch (error) {
    console.error("Error al eliminar imagen de Cloudinary:", error);
    return apiError(500, "Error interno del servidor");
  }
}
