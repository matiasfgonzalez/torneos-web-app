/**
 * Cliente de Cloudinary para uso server-side
 * 
 * Este módulo proporciona funciones para interactuar con Cloudinary
 * de forma segura desde el servidor, incluyendo:
 * - Generación de firmas para subidas seguras
 * - Eliminación de imágenes
 * 
 * ⚠️ IMPORTANTE: Este archivo solo debe usarse en el servidor.
 * Nunca importar en componentes client-side.
 */

import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

/**
 * Configurar Cloudinary con las credenciales del servidor
 * Se ejecuta automáticamente al importar este módulo
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Usar HTTPS siempre
});

// ============================================================================
// FUNCIONES DE FIRMA
// ============================================================================

/**
 * Genera una firma segura para subir imágenes desde el cliente
 * 
 * La firma se calcula usando el API Secret (que nunca llega al cliente)
 * y permite al cliente subir directamente a Cloudinary de forma segura.
 * 
 * @param params - Parámetros a incluir en la firma
 * @returns Objeto con signature, timestamp y credenciales públicas
 * 
 * @example
 * ```ts
 * const { signature, timestamp, cloudName, apiKey } = generateSignature({
 *   folder: "torneos/logos",
 * });
 * ```
 */
export function generateSignature(params: {
  folder?: string;
  tags?: string;
  timestamp?: number;
}): {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder?: string;
} {
  const timestamp = params.timestamp ?? Math.round(new Date().getTime() / 1000);
  
  // Parámetros que se incluirán en la firma
  // Deben coincidir exactamente con los que envíe el cliente
  const paramsToSign: Record<string, string | number> = {
    timestamp,
  };

  // Agregar parámetros opcionales si existen
  if (params.folder) {
    paramsToSign.folder = params.folder;
  }
  if (params.tags) {
    paramsToSign.tags = params.tags;
  }

  // Generar la firma usando el API Secret
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    signature,
    timestamp,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    folder: params.folder,
  };
}

// ============================================================================
// FUNCIONES DE ELIMINACIÓN
// ============================================================================

/**
 * Elimina una imagen de Cloudinary usando su public_id
 * 
 * @param publicId - ID público de la imagen a eliminar
 * @returns Resultado de la operación
 * @throws Error si la operación falla
 * 
 * @example
 * ```ts
 * const result = await deleteImage("torneos/logos/abc123");
 * console.log(result); // { result: "ok" }
 * ```
 */
export async function deleteImage(publicId: string): Promise<{ result: string }> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Error al eliminar imagen de Cloudinary:", error);
    throw new Error("No se pudo eliminar la imagen");
  }
}

/**
 * Elimina múltiples imágenes de Cloudinary
 * 
 * @param publicIds - Array de IDs públicos a eliminar
 * @returns Resultado de la operación por cada imagen
 * 
 * @example
 * ```ts
 * const results = await deleteImages(["img1", "img2", "img3"]);
 * ```
 */
export async function deleteImages(
  publicIds: string[]
): Promise<{ deleted: Record<string, string> }> {
  try {
    const result = await cloudinary.api.delete_resources(publicIds);
    return result;
  } catch (error) {
    console.error("Error al eliminar imágenes de Cloudinary:", error);
    throw new Error("No se pudieron eliminar las imágenes");
  }
}

// ============================================================================
// FUNCIONES DE SUBIDA (SERVER-SIDE)
// ============================================================================

/**
 * Sube una imagen directamente desde el servidor
 * 
 * Útil cuando necesitas procesar o transformar la imagen en el servidor
 * antes de subirla, o cuando la imagen viene de otra fuente (no del usuario).
 * 
 * @param file - Buffer o URL de la imagen
 * @param options - Opciones de subida
 * @returns Respuesta de Cloudinary con los datos de la imagen
 * 
 * @example
 * ```ts
 * const result = await uploadImage(buffer, {
 *   folder: "torneos/logos",
 *   transformation: { width: 200, height: 200, crop: "fill" }
 * });
 * ```
 */
export async function uploadImage(
  file: Buffer | string,
  options?: {
    folder?: string;
    publicId?: string;
    transformation?: Record<string, unknown>;
  }
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: options?.folder,
      public_id: options?.publicId,
      transformation: options?.transformation,
      resource_type: "image" as const,
    };

    // Si es un buffer, usar upload_stream
    if (Buffer.isBuffer(file)) {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve(result);
          }
        }
      );
      uploadStream.end(file);
    } else {
      // Si es una URL o path, usar upload normal
      cloudinary.uploader
        .upload(file, uploadOptions)
        .then(resolve)
        .catch(reject);
    }
  });
}

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Genera una URL optimizada para una imagen de Cloudinary
 * 
 * @param publicId - ID público de la imagen
 * @param options - Opciones de transformación
 * @returns URL optimizada
 * 
 * @example
 * ```ts
 * const url = getOptimizedUrl("torneos/logos/abc123", {
 *   width: 300,
 *   height: 300,
 *   crop: "fill"
 * });
 * ```
 */
export function getOptimizedUrl(
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string | number;
    format?: string;
  }
): string {
  return cloudinary.url(publicId, {
    secure: true,
    transformation: [
      {
        width: options?.width,
        height: options?.height,
        crop: options?.crop ?? "limit",
        quality: options?.quality ?? "auto",
        fetch_format: options?.format ?? "auto",
      },
    ],
  });
}

// Exportar la instancia de cloudinary por si se necesita acceso directo
export { cloudinary };
