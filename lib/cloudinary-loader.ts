/**
 * Loader de imágenes de Cloudinary para `next/image` (M2).
 *
 * En vez de que el optimizador de Vercel proxee y transforme cada imagen
 * (`/_next/image`, que cuesta transformaciones), delegamos el resize y el
 * formato a Cloudinary: se le pide la imagen ya en el ancho que hace falta, en
 * el mejor formato (`f_auto` → AVIF/WebP) y calidad automática (`q_auto`). Es el
 * patrón recomendado para Cloudinary + next/image.
 *
 * Solo aplica a URLs de entrega de Cloudinary (`res.cloudinary.com/.../upload/`).
 * Cualquier otra URL (placeholder local, avatar de Clerk) se devuelve tal cual.
 */

const UPLOAD = "/upload/";

/** Inserta transformaciones después de `/upload/` en una URL de Cloudinary. */
function withTransforms(src: string, transforms: string): string {
  const i = src.indexOf(UPLOAD);
  if (i === -1) return src; // no es una URL de entrega estándar de Cloudinary
  const cut = i + UPLOAD.length;
  return `${src.slice(0, cut)}${transforms}/${src.slice(cut)}`;
}

export function cloudinaryLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  // `c_limit`: nunca agranda la imagen por encima de su tamaño real (no pixela).
  return withTransforms(
    src,
    `f_auto,q_${quality ?? "auto"},w_${width},c_limit`,
  );
}

/**
 * URL minúscula y borrosa para el `blurDataURL` del efecto blur-up de una
 * portada/foto grande. Cloudinary la sirve en ~24px muy comprimida.
 */
export function cloudinaryBlur(src: string): string | undefined {
  if (!src.includes(UPLOAD)) return undefined;
  return withTransforms(src, "e_blur:1500,q_1,f_auto,w_24");
}

/** ¿Es una URL de entrega de Cloudinary? */
export function isCloudinaryUrl(src: string): boolean {
  return src.includes("res.cloudinary.com") && src.includes(UPLOAD);
}
