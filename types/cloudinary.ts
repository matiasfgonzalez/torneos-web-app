/**
 * Tipos TypeScript para Cloudinary
 * 
 * Este archivo contiene todas las interfaces y tipos relacionados
 * con la integración de Cloudinary en la aplicación.
 */

import { z } from "zod";

// ============================================================================
// TIPOS DE RESPUESTA
// ============================================================================

/**
 * Respuesta de una subida exitosa a Cloudinary
 * Contiene la información necesaria para almacenar y mostrar la imagen
 */
export interface CloudinaryUploadResponse {
  /** ID público de la imagen en Cloudinary (necesario para eliminar) */
  public_id: string;
  /** URL segura de la imagen (usar esta para mostrar) */
  secure_url: string;
  /** URL HTTP de la imagen (menos segura, evitar usar) */
  url: string;
  /** Formato de la imagen (jpg, png, webp, etc.) */
  format: string;
  /** Ancho de la imagen en píxeles */
  width: number;
  /** Alto de la imagen en píxeles */
  height: number;
  /** Tamaño del archivo en bytes */
  bytes: number;
  /** Nombre original del archivo subido */
  original_filename: string;
  /** Tipo de recurso (image, video, raw) */
  resource_type: string;
  /** Fecha de creación */
  created_at: string;
}

/**
 * Parámetros recibidos para generar una firma de subida
 */
export interface CloudinarySignatureParams {
  /** Carpeta destino en Cloudinary */
  folder?: string;
  /** Timestamp de la solicitud */
  timestamp: number;
  /** Transformaciones a aplicar durante la subida */
  transformation?: string;
  /** Tags para categorizar la imagen */
  tags?: string;
}

/**
 * Respuesta del endpoint de firma
 */
export interface CloudinarySignatureResponse {
  /** Firma generada con el API Secret */
  signature: string;
  /** Timestamp usado para generar la firma */
  timestamp: number;
  /** Cloud name de la cuenta */
  cloudName: string;
  /** API Key (seguro exponer al cliente) */
  apiKey: string;
  /** Carpeta configurada */
  folder?: string;
}

/**
 * Respuesta del endpoint de eliminación
 */
export interface CloudinaryDeleteResponse {
  /** Resultado de la operación (ok, not found, etc.) */
  result: string;
  /** Mensaje adicional */
  message?: string;
}

// ============================================================================
// ESQUEMAS DE VALIDACIÓN ZOD
// ============================================================================

/**
 * Esquema para validar la solicitud de firma
 */
export const signatureRequestSchema = z.object({
  folder: z.string().optional(),
  tags: z.string().optional(),
});

/**
 * Esquema para validar la solicitud de eliminación
 */
export const deleteRequestSchema = z.object({
  publicId: z.string().min(1, "El public_id es requerido"),
});

/**
 * Esquema para validar datos de imagen en formularios
 * Útil para react-hook-form con zod
 */
export const cloudinaryImageSchema = z.object({
  secure_url: z.string().url("URL inválida").optional().nullable(),
  public_id: z.string().optional().nullable(),
});

// Tipos inferidos de los esquemas
export type SignatureRequest = z.infer<typeof signatureRequestSchema>;
export type DeleteRequest = z.infer<typeof deleteRequestSchema>;
export type CloudinaryImageData = z.infer<typeof cloudinaryImageSchema>;

// ============================================================================
// CONSTANTES
// ============================================================================

/** Tipos de archivo permitidos para subida */
export const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/jpg", 
  "image/png",
  "image/webp",
] as const;

/** Extensiones permitidas para validación visual */
export const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp"] as const;

/** Tamaño máximo de archivo en bytes (5MB) */
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

/** Tamaño máximo formateado para mostrar */
export const MAX_FILE_SIZE_LABEL = "5MB";
