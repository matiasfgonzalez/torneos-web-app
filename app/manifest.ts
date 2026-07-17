import type { MetadataRoute } from "next";

/**
 * Web App Manifest (S9. PWA). Next lo sirve en `/manifest.webmanifest` e inyecta
 * el `<link rel="manifest">` solo — no hay que declararlo a mano en el layout.
 *
 * El objetivo del enunciado: "los usuarios finales lo usan desde el celular en
 * la cancha". Por eso `start_url` cae en `/torneos` (lo que un hincha abre para
 * ver la tabla), no en la landing de marketing, y `display: standalone` para que
 * se sienta una app, sin barra de navegador.
 *
 * theme_color = violeta de marca (barra de estado en Android standalone).
 * background_color = blanco (pantalla de splash).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GOLAZO — Gestión de Torneos",
    short_name: "GOLAZO",
    description:
      "Seguí tus torneos, tablas de posiciones, partidos y equipos desde el celular. Gratis, sin tienda de apps.",
    id: "/",
    start_url: "/torneos",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#ad45ff",
    lang: "es-AR",
    dir: "ltr",
    categories: ["sports", "productivity"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Torneos",
        short_name: "Torneos",
        description: "Ver todos los torneos",
        url: "/torneos",
      },
      {
        name: "Partidos",
        short_name: "Partidos",
        description: "Fixture y resultados",
        url: "/partidos",
      },
      {
        name: "Equipos",
        short_name: "Equipos",
        description: "Buscar equipos",
        url: "/equipos",
      },
    ],
  };
}
