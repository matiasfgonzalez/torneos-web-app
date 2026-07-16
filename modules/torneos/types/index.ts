import { ITournamentTeam } from "./tournament-teams.types";

export interface ITorneo {
  id: string;
  name: string;
  description: string;
  // Categoría en 3 campos (M13)
  ageGroup: string;
  gender: string;
  division?: string | null;
  locality: string;
  status: string;
  enabled: boolean; // Si el torneo está habilitado/visible
  rules?: string | null; // Reglamento del torneo
  trophy?: string | null; // Premio/Trofeo del torneo
  /** Cupo de equipos (S3). `null` = sin límite propio del torneo. */
  maxTeams?: number | null;
  /** Cierre de inscripciones (S3). `null` = no cierra por fecha. */
  registrationDeadline?: string | Date | null;
  nextMatch: string | Date;
  startDate: string | Date;
  endDate: string | Date;
  organizationId: string;
  /** Slug del torneo (N9) — junto con organization.slug arma la URL canónica */
  slug?: string | null;
  /** Slug de la organización dueña (solo cargado en listados públicos) */
  organization?: { slug: string } | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  logoUrl?: string; // URL del logo del torneo
  logoPublicId?: string; // Public ID de Cloudinary para eliminar la imagen
  format: string; // Formato del torneo (Liga, Eliminación directa, etc.)
  homeAndAway: boolean; // Si el torneo es de ida y vuelta o solo un partido
  liga: string; // Liga a la que pertenece el torneo
  // Configuración deportiva (N7)
  pointsWin?: number;
  pointsDraw?: number;
  pointsLoss?: number;
  walkoverScore?: number;
  tiebreakers?: unknown; // array de criterios: PTS, DIF, GF, GA, WINS
  // Sanciones automáticas (N8)
  yellowsForSuspension?: number;
  matchesPerRedCard?: number;
  tournamentTeams?: ITournamentTeam[]; // Equipos que participan en el torneo
  tournamentPhases?: {
    id: string;
    name: string;
    order: number;
    type: string;
  }[]; // Fases del torneo
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  matches?: any[]; // Partidos del torneo
}
