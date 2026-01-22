/**
 * Módulo de Equipos
 *
 * Este módulo contiene toda la lógica relacionada con equipos:
 * - Actions: Server actions para CRUD de equipos
 * - Components: Componentes UI para admin y público
 * - Types: Tipos TypeScript del dominio
 */

// Actions
export * from "./actions/getEquipos";
export * from "./actions/getEquipoById";
export * from "./actions/getEquiposByTorneo";
export * from "./actions/getTournamentTeamPlayers";

// Types
export * from "./types/types";
