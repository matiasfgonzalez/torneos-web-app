/**
 * Estadísticas avanzadas del torneo (S7) — capa pura, sin Prisma.
 *
 * Las server actions (`modules/torneos/actions/getAdvancedStats.ts`,
 * `getHeadToHead.ts`) traen los datos y llaman a estas funciones.
 */
export type {
  StatTeamRef,
  StatMatch,
  StatCard,
  Outcome,
} from "./types";
export { isPlayed, teamOutcome } from "./match-outcome";
export { computeFairPlay, FAIR_PLAY_POINTS, type FairPlayRow } from "./fair-play";
export { computeTeamForm, type TeamForm, type Streak } from "./form";
export {
  computeHeadToHead,
  type HeadToHead,
  type H2HMatch,
} from "./head-to-head";
