"use client";

/**
 * Componente CloudinaryUpload
 * 
 * Componente reutilizable para subir imágenes a Cloudinary usando
 * el flujo de subida firmada (Signed Upload).
 * 
 * Características:
 * - Drag & drop con feedback visual
 * - Preview de imagen
 * - Estado de carga con indicador de progreso
 * - Validación de tipo y tamaño de archivo
 * - Integración con react-hook-form
 * - Soporte para carpetas dinámicas
 * - Eliminación de imagen
 * 
 * @example
 * ```tsx
 * // Uso básico
 * <CloudinaryUpload
 *   folder="torneos/logos"
 *   onUploadComplete={(data) => console.log(data)}
 * />
 * 
 * // Con react-hook-form
 * <Controller
 *   name="imageUrl"
 *   control={control}
 *   render={({ field }) => (
 *     <CloudinaryUpload
 *       folder="equipos/logos"
 *       value={field.value}
 *       onChange={(url, publicId) => {
 *         setValue("imageUrl", url);
 *         setValue("imagePublicId", publicId);
 *       }}
 *     />
 *   )}
 * />
 * ```
 */

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Upload, X, Loader2, ImageIcon, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ALLOWED_FILE_TYPES,
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE,
  MAX_FILE_SIZE_LABEL,
  type CloudinaryUploadResponse,
  type CloudinarySignatureResponse,
} from "@/types/cloudinary";

// ============================================================================
// TIPOS
// ============================================================================

interface CloudinaryUploadProps {
  /** Carpeta destino en Cloudinary (ej: "torneos/logos") */
  folder?: string;
  /** URL actual de la imagen (para mostrar preview) */
  value?: string | null;
  /** Public ID actual de la imagen (para eliminar) */
  publicId?: string | null;
  /** Callback cuando se completa la subida */
  onUploadComplete?: (data: { url: string; publicId: string }) => void;
  /** Callback genérico para integración con formularios */
  onChange?: (url: string | null, publicId: string | null) => void;
  /** Callback cuando ocurre un error */
  onError?: (error: string) => void;
  /** Deshabilitar el componente */
  disabled?: boolean;
  /** Clases CSS adicionales */
  className?: string;
  /** Texto del placeholder */
  placeholder?: string;
  /** Mostrar tamaño máximo permitido */
  showMaxSize?: boolean;
}

// ============================================================================
// COMPONENTE
// ============================================================================

export function CloudinaryUpload({
  folder,
  value,
  publicId,
  onUploadComplete,
  onChange,
  onError,
  disabled = false,
  className,
  placeholder = "Arrastra una imagen o haz clic para seleccionar",
  showMaxSize = true,
}: CloudinaryUploadProps) {
  // Estados
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value ?? null);
  const [currentPublicId, setCurrentPublicId] = useState<string | null>(
    publicId ?? null
  );

  // Referencias
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ============================================================================
  // VALIDACIÓN
  // ============================================================================

  /**
   * Valida que el archivo sea una imagen permitida y no exceda el tamaño máximo
   */
  const validateFile = (file: File): string | null => {
    // Validar tipo de archivo
    if (!ALLOWED_FILE_TYPES.includes(file.type as typeof ALLOWED_FILE_TYPES[number])) {
      return `Tipo de archivo no permitido. Solo se aceptan: ${ALLOWED_EXTENSIONS.join(", ")}`;
    }

    // Validar tamaño
    if (file.size > MAX_FILE_SIZE) {
      return `El archivo es demasiado grande. Tamaño máximo: ${MAX_FILE_SIZE_LABEL}`;
    }

    return null;
  };

  // ============================================================================
  // SUBIDA
  // ============================================================================

  /**
   * Obtiene la firma del servidor para la subida segura
   */
  const getSignature = async (): Promise<CloudinarySignatureResponse> => {
    const response = await fetch("/api/cloudinary/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folder }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Error al obtener firma");
    }

    return response.json();
  };

  /**
   * Sube el archivo a Cloudinary usando la firma obtenida
   */
  const uploadToCloudinary = async (
    file: File,
    signatureData: CloudinarySignatureResponse
  ): Promise<CloudinaryUploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", signatureData.apiKey);
    formData.append("timestamp", signatureData.timestamp.toString());
    formData.append("signature", signatureData.signature);
    
    if (signatureData.folder) {
      formData.append("folder", signatureData.folder);
    }

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`;

    const response = await fetch(cloudinaryUrl, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Error al subir imagen");
    }

    return response.json();
  };

  /**
   * Maneja el proceso completo de subida
   */
  const handleUpload = useCallback(
    async (file: File) => {
      // Limpiar error anterior
      setError(null);

      // Validar archivo
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        onError?.(validationError);
        return;
      }

      setIsUploading(true);
      setUploadProgress(10);

      try {
        // Si hay una imagen anterior, eliminarla primero
        if (currentPublicId) {
          await deleteImage(currentPublicId);
        }

        // Obtener firma
        setUploadProgress(30);
        const signatureData = await getSignature();

        // Subir a Cloudinary
        setUploadProgress(50);
        const uploadResult = await uploadToCloudinary(file, signatureData);

        setUploadProgress(100);

        // Actualizar estado local
        setPreviewUrl(uploadResult.secure_url);
        setCurrentPublicId(uploadResult.public_id);

        // Notificar al padre
        onUploadComplete?.({
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
        });
        onChange?.(uploadResult.secure_url, uploadResult.public_id);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error desconocido al subir";
        setError(errorMessage);
        onError?.(errorMessage);
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    [currentPublicId, folder, onChange, onError, onUploadComplete]
  );

  // ============================================================================
  // ELIMINACIÓN
  // ============================================================================

  /**
   * Elimina la imagen actual de Cloudinary
   */
  const deleteImage = async (publicIdToDelete: string) => {
    try {
      const response = await fetch("/api/cloudinary/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId: publicIdToDelete }),
      });

      if (!response.ok) {
        console.warn("No se pudo eliminar la imagen anterior");
      }
    } catch (err) {
      console.warn("Error al eliminar imagen:", err);
    }
  };

  /**
   * Maneja la acción de eliminar imagen del usuario
   */
  const handleRemove = async () => {
    if (!currentPublicId) return;

    setIsUploading(true);
    try {
      await deleteImage(currentPublicId);
      setPreviewUrl(null);
      setCurrentPublicId(null);
      onChange?.(null, null);
    } catch (err) {
      console.error("Error al eliminar:", err);
    } finally {
      setIsUploading(false);
    }
  };

  // ============================================================================
  // DRAG & DROP
  // ============================================================================

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleUpload(files[0]);
    }
  };

  // ============================================================================
  // INPUT FILE
  // ============================================================================

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleUpload(files[0]);
    }
    // Limpiar input para permitir seleccionar el mismo archivo
    e.target.value = "";
  };

  const openFileSelector = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={cn("space-y-2", className)}>
      {/* Área de subida / Preview */}
      <div
        onClick={openFileSelector}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative flex flex-col items-center justify-center",
          "w-full min-h-[180px] rounded-lg border-2 border-dashed",
          "transition-all duration-200 cursor-pointer",
          "bg-muted/30 hover:bg-muted/50",
          isDragging && "border-primary bg-primary/10",
          disabled && "opacity-50 cursor-not-allowed",
          error && "border-destructive",
          !previewUrl && !isUploading && "border-muted-foreground/25"
        )}
      >
        {/* Preview de imagen */}
        {previewUrl && !isUploading && (
          <div className="relative w-full h-full min-h-[180px]">
            <Image
              src={previewUrl}
              alt="Preview"
              fill
              className="object-contain rounded-lg p-2"
              sizes="(max-width: 768px) 100vw, 300px"
            />
            {/* Botón de eliminar */}
            {!disabled && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-lg"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {/* Estado de carga */}
        {isUploading && (
          <div className="flex flex-col items-center gap-3 p-6">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Subiendo imagen... {uploadProgress}%
            </p>
            {/* Barra de progreso */}
            <div className="w-full max-w-[200px] h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Placeholder */}
        {!previewUrl && !isUploading && (
          <div className="flex flex-col items-center gap-3 p-6 text-center">
            {isDragging ? (
              <>
                <Upload className="h-10 w-10 text-primary animate-bounce" />
                <p className="text-sm font-medium text-primary">
                  Suelta la imagen aquí
                </p>
              </>
            ) : (
              <>
                <ImageIcon className="h-10 w-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{placeholder}</p>
                {showMaxSize && (
                  <p className="text-xs text-muted-foreground/70">
                    Formatos: {ALLOWED_EXTENSIONS.join(", ")} • Máximo:{" "}
                    {MAX_FILE_SIZE_LABEL}
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Input oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_FILE_TYPES.join(",")}
        onChange={handleFileChange}
        disabled={disabled || isUploading}
        className="hidden"
      />
    </div>
  );
}

export default CloudinaryUpload;
