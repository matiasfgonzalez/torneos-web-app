/**
 * Módulo de Torneos
 *
 * Este módulo contiene toda la lógica relacionada con torneos:
 * - Actions: Server actions para CRUD de torneos
 * - Components: Componentes UI para admin y público
 * - Types: Tipos TypeScript del dominio
 */

// Actions
export * from "./actions/getTorneos";
export * from "./actions/getTorneoById";
export * from "./actions/getTournamentTeams";

// Types
export * from "./types/fases.types";
export * from "./types/tournament-teams.types";

// Components
export { StandingsTable } from "./components/StandingsTable";
export { KnockoutBracket } from "./components/KnockoutBracket";
export { PublicStandingsSection } from "./components/PublicStandingsSection";
export { AdminStandingsSection } from "./components/admin/AdminStandingsSection";
