import {
  AgeGroup,
  Gender,
  TournamentStatus,
  TournamentFormat,
  MatchStatus,
  PlayerStatus,
  PlayerPosition,
  Foot,
  UserStatus,
  PayStatus,
} from "@prisma/client";

// ============================================
// CATEGORÍA DE TORNEO (M13: ageGroup + gender + division)
// ============================================

export const AGE_GROUP_LABELS: Record<AgeGroup, string> = {
  LIBRE: "Libre",
  ESCUELITA: "Escuelita",
  MINI: "Mini",
  INFANTIL: "Infantil",
  JUVENIL: "Juvenil",
  SUB_17: "Sub-17",
  SUB_20: "Sub-20",
  SENIOR: "Senior",
  M30: "Mayores de 30",
  VETERANO: "Veterano",
  PREVETERANO: "Pre-Veterano",
  SUPERVETERANO: "Super Veterano",
  MASTER: "Master",
};

export const AGE_GROUP_OPTIONS = Object.entries(AGE_GROUP_LABELS).map(
  ([value, label]) => ({
    value: value as AgeGroup,
    label,
  }),
);

export const GENDER_LABELS: Record<Gender, string> = {
  MASCULINO: "Masculino",
  FEMENINO: "Femenino",
  MIXTO: "Mixto",
};

export const GENDER_OPTIONS = Object.entries(GENDER_LABELS).map(
  ([value, label]) => ({
    value: value as Gender,
    label,
  }),
);

/**
 * Etiqueta legible de la categoría de un torneo a partir de sus 3 campos.
 * Ej: "Sub-17 Femenino A" · "Libre Masculino" · "Veterano Mixto Primera"
 */
export function formatTournamentCategory(t: {
  ageGroup: string;
  gender: string;
  division?: string | null;
}): string {
  const age = AGE_GROUP_LABELS[t.ageGroup as AgeGroup] ?? t.ageGroup;
  const gender = GENDER_LABELS[t.gender as Gender] ?? t.gender;
  return [age, gender, t.division].filter(Boolean).join(" ");
}

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
// ESTADOS DE PARTIDO
// ============================================

export const MATCH_STATUS_LABELS: Record<MatchStatus, string> = {
  PROGRAMADO: "Programado",
  EN_JUEGO: "En Juego",
  ENTRETIEMPO: "Entretiempo",
  FINALIZADO: "Finalizado",
  SUSPENDIDO: "Suspendido",
  POSTERGADO: "Postergado",
  CANCELADO: "Cancelado",
  WALKOVER: "Walkover",
};

export const MATCH_STATUS_OPTIONS = Object.entries(MATCH_STATUS_LABELS).map(
  ([value, label]) => ({
    value: value as MatchStatus,
    label,
  }),
);

// ============================================
// ESTADOS DE USUARIO
// ============================================

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  ACTIVO: "Activo",
  INACTIVO: "Inactivo",
  SUSPENDIDO: "Suspendido",
  PENDIENTE: "Pendiente",
};

// ============================================
// ESTADOS DE PAGO
// ============================================

export const PAY_STATUS_LABELS: Record<PayStatus, string> = {
  PENDIENTE: "Pendiente",
  APROBADO: "Aprobado",
  RECHAZADO: "Rechazado",
};

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
