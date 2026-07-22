import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/urls";

/**
 * robots.txt (M3). Indexa lo público; bloquea panel, APIs y áreas privadas de
 * cuenta. Apunta al sitemap para descubrimiento.
 */
export default function robots(): MetadataRoute.Robots {
  const base = getBaseUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/api",
          "/profile",
          "/notificaciones",
          "/mi-equipo",
          "/mi-ficha",
          "/bienvenida",
          "/crear-liga",
          "/sign-in",
          "/sign-up",
          "/sso-callback",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
