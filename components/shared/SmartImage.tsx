import Image, { type ImageProps } from "next/image";
import {
  cloudinaryLoader,
  cloudinaryBlur,
  isCloudinaryUrl,
} from "@/lib/cloudinary-loader";

/**
 * Imagen de la app (M2) — envuelve `next/image` con lo que este proyecto
 * necesita en un solo lugar, para no repetir la config en los ~40 sitios que
 * antes usaban `<img>`:
 *
 * - **Cloudinary:** usa el `cloudinaryLoader` (resize + `f_auto`/`q_auto` en el
 *   origen). Otras URLs (avatar de Clerk) pasan por el optimizador default de
 *   Next; los `.svg` locales (placeholder) van sin optimizar.
 * - **Fallback:** si no hay `src`, cae a `/placeholder.svg` (o `fallbackSrc`).
 * - **Blur-up opcional** (`blur`) para portadas/fotos grandes de Cloudinary; en
 *   logos/avatares chicos no se usa (una request extra para nada).
 *
 * Sirve tanto en server como en client components. Uso típico (avatar/logo en
 * un contenedor de tamaño fijo):
 *
 * ```tsx
 * <SmartImage src={team.logoUrl} alt="" width={40} height={40}
 *   className="h-full w-full object-cover" />
 * ```
 *
 * Para portadas usar `fill` + `sizes` dentro de un contenedor `relative`.
 */
export interface SmartImageProps
  extends Omit<ImageProps, "loader" | "src" | "alt" | "placeholder"> {
  src: string | null | undefined;
  alt: string;
  /** Activa el blur-up (solo tiene efecto en imágenes de Cloudinary). */
  blur?: boolean;
  /** Imagen a mostrar si `src` viene vacío. Default: `/placeholder.svg`. */
  fallbackSrc?: string;
}

export function SmartImage({
  src,
  alt,
  blur = false,
  fallbackSrc = "/placeholder.svg",
  ...rest
}: SmartImageProps) {
  const finalSrc = src || fallbackSrc;
  const cloudinary = isCloudinaryUrl(finalSrc);
  const useBlur = blur && cloudinary;

  return (
    <Image
      src={finalSrc}
      alt={alt}
      loader={cloudinary ? cloudinaryLoader : undefined}
      // Los SVG (placeholder) no se optimizan; el resto de no-Cloudinary va por
      // el optimizador default de Next.
      unoptimized={!cloudinary && finalSrc.endsWith(".svg")}
      placeholder={useBlur ? "blur" : "empty"}
      blurDataURL={useBlur ? cloudinaryBlur(finalSrc) : undefined}
      {...rest}
    />
  );
}

export default SmartImage;
