"use client";

// `"use client"` es obligatorio: `next/image` es un Client Component y el prop
// `loader` es una **función**. Si `SmartImage` fuera un componente de servidor,
// pasar `cloudinaryLoader` a `<Image>` cruzaría la frontera RSC servidor→cliente
// y React tira "Functions cannot be passed directly to Client Components"
// (500 en SSR). Como client component, el loader se aplica del lado del cliente
// y nunca se serializa. Todos sus props (src, alt, width…) son serializables,
// así que se puede seguir usando desde server components sin problema.

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
  const isRemote = /^https?:\/\//i.test(finalSrc);

  // `next/image` valida el host contra `images.remotePatterns` SOLO cuando la
  // imagen pasa por el optimizador default. Con un host no listado el render
  // **tira** (500 en SSR) — cosa que el `<img>` viejo nunca hacía. Como no
  // controlamos todos los orígenes (avatares de OAuth en googleusercontent,
  // logos externos de datos demo/legacy), cualquier URL remota que no sea
  // Cloudinary se sirve **sin optimizar**: se emite tal cual, sin chequeo de
  // host, igual que antes. Cloudinary usa su loader propio (tampoco valida
  // host) y los SVG locales van sin optimizar.
  const unoptimized = !cloudinary && (isRemote || finalSrc.endsWith(".svg"));

  return (
    <Image
      src={finalSrc}
      alt={alt}
      loader={cloudinary ? cloudinaryLoader : undefined}
      unoptimized={unoptimized}
      placeholder={useBlur ? "blur" : "empty"}
      blurDataURL={useBlur ? cloudinaryBlur(finalSrc) : undefined}
      {...rest}
    />
  );
}

export default SmartImage;
