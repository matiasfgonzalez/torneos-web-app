/**
 * Navegación pública unificada (F2): el Header muestra SIEMPRE las mismas
 * secciones del sitio, esté donde esté el usuario — antes la landing mostraba
 * anclas (#features/#contacto) que desaparecían al navegar a otra página.
 */
export const siteLinks = [
  { href: "/ligas", label: "Ligas" },
  { href: "/torneos", label: "Torneos" },
  { href: "/partidos", label: "Partidos" },
  { href: "/equipos", label: "Equipos" },
  { href: "/jugadores", label: "Jugadores" },
  { href: "/noticias", label: "Noticias" },
] as const;

/**
 * Extra solo para visitantes anónimos: para ellos "/" es la landing de
 * marketing, así que el ancla /#precios funciona desde cualquier página.
 * (Un usuario logueado ve FanHome en "/" — sin sección de precios — y
 * gestiona su plan desde /admin/plan.)
 */
export const anonLinks = [{ href: "/#precios", label: "Precios" }] as const;
