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
import { auth } from "@clerk/nextjs/server";
import { deleteImage } from "@/lib/cloudinary";
import { deleteRequestSchema } from "@/types/cloudinary";

export async function DELETE(request: Request) {
  try {
    // Verificar autenticación
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "No autorizado. Debes iniciar sesión." },
        { status: 401 }
      );
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
