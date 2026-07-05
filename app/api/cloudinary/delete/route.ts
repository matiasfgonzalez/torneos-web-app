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

import { NextResponse } from "next/server";
import { deleteImage } from "@/lib/cloudinary";
import { deleteRequestSchema } from "@/types/cloudinary";
import { requireApiOrgContext } from "@/lib/orgAuth";

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
      return NextResponse.json(
        { error: "Datos inválidos", details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { publicId } = validationResult.data;

    // Eliminar la imagen de Cloudinary
    const result = await deleteImage(publicId);

    // Verificar el resultado
    if (result.result === "ok") {
      return NextResponse.json({
        result: "ok",
        message: "Imagen eliminada correctamente",
      });
    } else if (result.result === "not found") {
      return NextResponse.json({
        result: "not found",
        message: "La imagen no existe o ya fue eliminada",
      });
    } else {
      return NextResponse.json({
        result: result.result,
        message: "Resultado inesperado al eliminar la imagen",
      });
    }
  } catch (error) {
    console.error("Error al eliminar imagen de Cloudinary:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
