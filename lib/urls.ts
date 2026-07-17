/**
 * URL base absoluta de la app.
 *
 * Hace falta en todo lo que sale de la app y se abre en otro lado: links de
 * email (S5), imágenes OG, texto de WhatsApp y QR (S4). Una ruta relativa no
 * sirve en ninguno de esos contextos.
 *
 * Orden de resolución:
 * 1. `NEXT_PUBLIC_APP_URL` — la fuente de verdad en producción (dominio real).
 * 2. `VERCEL_URL` — el deploy de preview, que no tiene dominio propio.
 * 3. `localhost:3000` — desarrollo.
 */
export function getBaseUrl(): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ??
    "http://localhost:3000";
  return base.replace(/\/$/, "");
}

/** Convierte una ruta interna (`/liga/x/y`) en URL absoluta. */
export function absoluteUrl(path: string): string {
  return `${getBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}
