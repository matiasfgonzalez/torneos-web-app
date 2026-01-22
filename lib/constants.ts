import {
  TournamentCategory,
  TournamentStatus,
  TournamentFormat,
  PlayerStatus,
  PlayerPosition,
  Foot,
} from "@prisma/client";

// ============================================
// CATEGORÍAS DE TORNEO
// ============================================

// Mapeo de categorías a etiquetas en español
export const TOURNAMENT_CATEGORY_LABELS: Record<TournamentCategory, string> = {
  LIBRE: "Libre",
  SENIOR: "Senior",
  SUB_17: "Sub-17",
  SUB_20: "Sub-20",
  RESERVA: "Reserva",
  PRIMERA: "Primera",
  SEGUNDA: "Segunda",
  VETERANO: "Veterano",
  PREVETERANO: "Pre-Veterano",
  SUPERVETERANO: "Super Veterano",
  FEMENINO: "Femenino",
  MASCULINO: "Masculino",
  INFANTIL: "Infantil",
  MINI: "Mini",
  ESCUELITA: "Escuelita",
  MIXTO: "Mixto",
  MASTER: "Master",
  JUVENIL: "Juvenil",
  M30: "Mayores de 30",
};

// Lista de todas las categorías (del enum de Prisma)
export const TOURNAMENT_CATEGORIES = Object.values(TournamentCategory);

// Array con label y value para selects
export const TOURNAMENT_CATEGORIES_OPTIONS = Object.entries(
  TOURNAMENT_CATEGORY_LABELS,
).map(([value, label]) => ({
  value: value as TournamentCategory,
  label,
}));

// ============================================
// ESTADOS DE TORNEO
// ============================================

// Mapeo de estados a etiquetas en español
export const TOURNAMENT_STATUS_LABELS: Record<TournamentStatus, string> = {
  BORRADOR: "Borrador",
  INSCRIPCION: "Inscripción Abierta",
  PENDIENTE: "Por Iniciar",
  ACTIVO: "En Curso",
  SUSPENDIDO: "Suspendido",
  FINALIZADO: "Finalizado",
  CANCELADO: "Cancelado",
  ARCHIVADO: "Archivado",
};

// Lista de todos los estados (del enum de Prisma)
export const TOURNAMENT_STATUSES = Object.values(TournamentStatus);

// Array con label y value para selects
export const TOURNAMENT_STATUS_OPTIONS = Object.entries(
  TOURNAMENT_STATUS_LABELS,
).map(([value, label]) => ({
  value: value as TournamentStatus,
  label,
}));

// ============================================
// FORMATOS DE TORNEO
// ============================================

// Mapeo de formatos a etiquetas en español
export const TOURNAMENT_FORMAT_LABELS: Record<TournamentFormat, string> = {
  LIGA: "Liga",
  COPA: "Copa",
  ELIMINACION_DIRECTA: "Eliminación Directa",
  DOBLE_ELIMINACION: "Doble Eliminación",
  GRUPOS: "Fase de Grupos",
  IDA_Y_VUELTA: "Ida y Vuelta",
  ROUND_ROBIN: "Round Robin",
  SUIZO: "Sistema Suizo",
  MIXTO: "Mixto",
  PLAYOFFS: "Playoffs",
  LIGUILLA: "Liguilla",
  TODOS_CONTRA_TODOS: "Todos Contra Todos",
  PUNTOS_ACUMULADOS: "Puntos Acumulados",
  AMISTOSO: "Amistoso",
};

// Lista de todos los formatos (del enum de Prisma)
export const TOURNAMENT_FORMATS = Object.values(TournamentFormat);

// Array con label y value para selects
export const TOURNAMENT_FORMAT_OPTIONS = Object.entries(
  TOURNAMENT_FORMAT_LABELS,
).map(([value, label]) => ({
  value: value as TournamentFormat,
  label,
}));

// ============================================
// CONSTANTES LEGACY (para compatibilidad)
// ============================================

// @deprecated - Usar TOURNAMENT_CATEGORIES
export const TOURNAMENT_CATEGORIES_DESC = TOURNAMENT_CATEGORIES;

// @deprecated - Usar TOURNAMENT_FORMATS
export const TOURNAMENT_FORMATS_DESC = TOURNAMENT_FORMATS;

// @deprecated - Usar TOURNAMENT_STATUSES
export const TORNAMENT_STATUS_DESC = TOURNAMENT_STATUSES;

// ============================================
// ESTADOS DE JUGADOR
// ============================================

// Mapeo de estados a etiquetas en español
export const PLAYER_STATUS_LABELS: Record<PlayerStatus, string> = {
  ACTIVO: "Activo",
  LESIONADO: "Lesionado",
  SUSPENDIDO: "Suspendido",
  NO_DISPONIBLE: "No Disponible",
  RETIRADO: "Retirado",
  TRANSFERIDO: "Transferido",
  PRUEBA: "A Prueba",
  EXPULSADO: "Expulsado",
};

// Lista de todos los estados (del enum de Prisma)
export const PLAYER_STATUSES = Object.values(PlayerStatus);

// Array con label y value para selects
export const PLAYER_STATUS_OPTIONS = Object.entries(PLAYER_STATUS_LABELS).map(
  ([value, label]) => ({
    value: value as PlayerStatus,
    label,
  }),
);

// Colores para estados de jugador
export const PLAYER_STATUS_COLORS: Record<PlayerStatus, string> = {
  ACTIVO: "bg-green-500",
  LESIONADO: "bg-red-500",
  SUSPENDIDO: "bg-yellow-500",
  NO_DISPONIBLE: "bg-gray-500",
  RETIRADO: "bg-slate-600",
  TRANSFERIDO: "bg-blue-500",
  PRUEBA: "bg-orange-500",
  EXPULSADO: "bg-red-700",
};

// ============================================
// POSICIONES DE JUGADOR
// ============================================

// Mapeo de posiciones a etiquetas en español
export const PLAYER_POSITION_LABELS: Record<PlayerPosition, string> = {
  ARQUERO: "Arquero",
  DEFENSOR_CENTRAL: "Defensor Central",
  LATERAL_DERECHO: "Lateral Derecho",
  LATERAL_IZQUIERDO: "Lateral Izquierdo",
  CARRILERO_DERECHO: "Carrilero Derecho",
  CARRILERO_IZQUIERDO: "Carrilero Izquierdo",
  VOLANTE_DEFENSIVO: "Volante Defensivo",
  PIVOTE: "Pivote",
  VOLANTE_CENTRAL: "Volante Central",
  VOLANTE_OFENSIVO: "Volante Ofensivo",
  INTERIOR_DERECHO: "Interior Derecho",
  INTERIOR_IZQUIERDO: "Interior Izquierdo",
  ENGANCHE: "Enganche",
  EXTREMO_DERECHO: "Extremo Derecho",
  EXTREMO_IZQUIERDO: "Extremo Izquierdo",
  DELANTERO_CENTRO: "Delantero Centro",
  SEGUNDO_DELANTERO: "Segundo Delantero",
  FALSO_9: "Falso 9",
};

// Lista de todas las posiciones (del enum de Prisma)
export const PLAYER_POSITIONS = Object.values(PlayerPosition);

// Array con label y value para selects
export const PLAYER_POSITION_OPTIONS = Object.entries(
  PLAYER_POSITION_LABELS,
).map(([value, label]) => ({
  value: value as PlayerPosition,
  label,
}));

// Categorías de posición para agrupar
export const PLAYER_POSITION_CATEGORIES = {
  ARQUERO: ["ARQUERO"],
  DEFENSA: [
    "DEFENSOR_CENTRAL",
    "LATERAL_DERECHO",
    "LATERAL_IZQUIERDO",
    "CARRILERO_DERECHO",
    "CARRILERO_IZQUIERDO",
  ],
  MEDIOCAMPO: [
    "VOLANTE_DEFENSIVO",
    "PIVOTE",
    "VOLANTE_CENTRAL",
    "VOLANTE_OFENSIVO",
    "INTERIOR_DERECHO",
    "INTERIOR_IZQUIERDO",
    "ENGANCHE",
  ],
  DELANTERO: [
    "EXTREMO_DERECHO",
    "EXTREMO_IZQUIERDO",
    "DELANTERO_CENTRO",
    "SEGUNDO_DELANTERO",
    "FALSO_9",
  ],
};

// ============================================
// PIE DOMINANTE
// ============================================

// Mapeo de pie a etiquetas en español
export const FOOT_LABELS: Record<Foot, string> = {
  IZQUIERDA: "Izquierda",
  DERECHA: "Derecha",
  AMBOS: "Ambidiestro",
};

// Lista de todos los pies (del enum de Prisma)
export const FEET = Object.values(Foot);

// Array con label y value para selects
export const FOOT_OPTIONS = Object.entries(FOOT_LABELS).map(
  ([value, label]) => ({
    value: value as Foot,
    label,
  }),
);

// Colores para pie dominante
export const FOOT_COLORS: Record<Foot, string> = {
  IZQUIERDA: "text-blue-400",
  DERECHA: "text-green-400",
  AMBOS: "text-purple-400",
};
