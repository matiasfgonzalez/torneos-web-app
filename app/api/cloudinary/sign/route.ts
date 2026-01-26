/**
 * API Route: Firma para subida segura a Cloudinary
 * 
 * Este endpoint genera una firma criptográfica que permite al cliente
 * subir archivos directamente a Cloudinary de forma segura, sin exponer
 * el API Secret.
 * 
 * Método: POST
 * Body: { folder?: string, tags?: string }
 * Response: { signature, timestamp, cloudName, apiKey, folder }
 */

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateSignature } from "@/lib/cloudinary";
import { signatureRequestSchema } from "@/types/cloudinary";

export async function POST(request: Request) {
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
    const validationResult = signatureRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { folder, tags } = validationResult.data;

    // Generar la firma
    const signatureData = generateSignature({
      folder,
      tags,
    });

    return NextResponse.json(signatureData);
  } catch (error) {
    console.error("Error al generar firma de Cloudinary:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
