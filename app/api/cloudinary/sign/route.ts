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

import { generateSignature } from "@/lib/cloudinary";
import { signatureRequestSchema } from "@/types/cloudinary";
import { requireApiOrgContext } from "@/lib/orgAuth";
import { apiError, apiOk } from "@/lib/apiResponse";

export async function POST(request: Request) {
  try {
    // Solo gestores de una organización (o admin) obtienen firmas de subida
    const auth = await requireApiOrgContext();
    if (auth.error) {
      return auth.error;
    }

    // Parsear y validar el body
    const body = await request.json();
    const validationResult = signatureRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return apiError(400, "Datos inválidos", validationResult.error.issues);
    }

    const { folder, tags } = validationResult.data;

    // Generar la firma
    const signatureData = generateSignature({
      folder,
      tags,
    });

    return apiOk(signatureData);
  } catch (error) {
    console.error("Error al generar firma de Cloudinary:", error);
    return apiError(500, "Error interno del servidor");
  }
}
