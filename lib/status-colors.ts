import {
  MatchStatus,
  PayStatus,
  PlayerStatus,
  TournamentStatus,
  UserStatus,
} from "@prisma/client";

/**
 * Mapas ÚNICOS de color por estado (F0 del rediseño frontend).
 *
 * Formato canónico "badge suave con borde" (mismo que REFEREE_STATUS_COLORS,
 * ver docs/DESIGN_SYSTEM.md §4): par claro/oscuro explícito, texto -700 sobre
 * fondo -50 en claro y -400 sobre -500/20 en oscuro. Antes de inventar un
 * color nuevo, agregalo acá — nunca inline en el JSX.
 *
 * Consumidor principal: <StatusBadge> (components/shared/StatusBadge.tsx).
 * Los mapas de árbitro viven en modules/arbitros/types (REFEREE_STATUS_COLORS)
 * y el estilo "dot sólido" de jugador en PLAYER_STATUS_COLORS (lib/constants).
 */

// ⚠️ Tailwind necesita ver las clases completas para compilarlas: por eso los
// mapas escriben las clases literales (no generar `bg-${color}-50` dinámico).

export const TOURNAMENT_STATUS_COLORS: Record<TournamentStatus, string> = {
  BORRADOR:
    "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-500/20 dark:text-gray-400 dark:border-gray-500/30",
  INSCRIPCION:
    "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30",
  PENDIENTE:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30",
  ACTIVO:
    "bg-green-50 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30",
  SUSPENDIDO:
    "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/30",
  FINALIZADO:
    "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-500/20 dark:text-gray-400 dark:border-gray-500/30",
  CANCELADO:
    "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30",
  ARCHIVADO:
    "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-500/20 dark:text-gray-400 dark:border-gray-500/30",
};

export const MATCH_STATUS_COLORS: Record<MatchStatus, string> = {
  PROGRAMADO:
    "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30",
  // "En vivo" es la excepción deliberada: badge sólido con pulso
  EN_JUEGO: "bg-green-500 text-white border-transparent animate-pulse",
  ENTRETIEMPO: "bg-amber-500 text-white border-transparent animate-pulse",
  FINALIZADO:
    "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-500/20 dark:text-gray-400 dark:border-gray-500/30",
  SUSPENDIDO:
    "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/30",
  POSTERGADO:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30",
  CANCELADO:
    "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30",
  WALKOVER:
    "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/30",
};

/**
 * Versión "badge suave" de estados de jugador. El mapa PLAYER_STATUS_COLORS
 * de lib/constants.ts (bg sólido) queda para dots/marcadores pequeños.
 */
export const PLAYER_STATUS_BADGE_COLORS: Record<PlayerStatus, string> = {
  ACTIVO:
    "bg-green-50 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30",
  LESIONADO:
    "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30",
  SUSPENDIDO:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30",
  NO_DISPONIBLE:
    "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-500/20 dark:text-gray-400 dark:border-gray-500/30",
  RETIRADO:
    "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-500/20 dark:text-gray-400 dark:border-gray-500/30",
  TRANSFERIDO:
    "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30",
  PRUEBA:
    "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/30",
  EXPULSADO:
    "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30",
};

export const USER_STATUS_COLORS: Record<UserStatus, string> = {
  ACTIVO:
    "bg-green-50 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30",
  INACTIVO:
    "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-500/20 dark:text-gray-400 dark:border-gray-500/30",
  SUSPENDIDO:
    "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30",
  PENDIENTE:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30",
};

export const PAY_STATUS_COLORS: Record<PayStatus, string> = {
  PENDIENTE:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30",
  APROBADO:
    "bg-green-50 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30",
  RECHAZADO:
    "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30",
};

/**
 * Excepción deliberada (mismo criterio que MATCH_STATUS_COLORS.EN_JUEGO):
 * la card pública de torneo (F2, `TournamentCard`) superpone el badge sobre
 * un banner con textura/gradiente — un badge "suave" (bg-*-50) perdería
 * contraste ahí. Usa relleno sólido + texto blanco en vez del par claro/
 * oscuro estándar. No usar este mapa fuera de ese banner.
 */
export const TOURNAMENT_STATUS_SOLID_COLORS: Record<TournamentStatus, string> = {
  BORRADOR: "bg-gray-400 text-white",
  INSCRIPCION: "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-blue-500/25",
  PENDIENTE: "bg-gradient-to-r from-brand to-brand-2 text-white shadow-brand/25",
  ACTIVO: "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-green-500/25",
  SUSPENDIDO: "bg-orange-500 text-white",
  FINALIZADO: "bg-gray-500 text-white",
  CANCELADO: "bg-red-500 text-white",
  ARCHIVADO: "bg-gray-600 text-white",
};
