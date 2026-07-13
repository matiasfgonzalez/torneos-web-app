/**
 * Sponsors de demostración de la landing (F1, 2026-07-13).
 *
 * Antes cada entrada hotlinkeaba el logo de una marca REAL (Nike, Adidas,
 * McDonald's, AFA) desde sitios de terceros — la CSP (C9, `img-src`) los
 * bloqueaba y se veían rotos, además del problema legal/de fiabilidad.
 * Ahora son marcas ficticias renderizadas como logos tipográficos con el
 * gradiente `color` (sin imágenes). Cuando existan sponsors reales, agregar
 * `logo` con su asset en Cloudinary y volver a `next/image`.
 */
export const sponsors = [
  { id: 1, name: "VELOCITY", color: "from-blue-600 to-blue-700" },
  { id: 2, name: "ANDES GEAR", color: "from-red-600 to-red-700" },
  { id: 3, name: "HIDRA+", color: "from-green-600 to-green-700" },
  { id: 4, name: "LITORAL FC", color: "from-purple-600 to-purple-700" },
  { id: 5, name: "VictoryPro", color: "from-orange-600 to-orange-700" },
  { id: 6, name: "GameMax", color: "from-teal-600 to-teal-700" },
] as const;

export const SPONSORS = sponsors;

export const featuredSponsor = {
  id: "featured-1",
  name: "MEGA SPORT",
  initials: "MS",
  title: "Mega Sport - Equipamiento Deportivo",
  description:
    "Nos enorgullece patrocinar GOLAZO, la plataforma que está revolucionando la gestión de torneos deportivos. Juntos promovemos el deporte profesional y la excelencia competitiva.",
} as const;

