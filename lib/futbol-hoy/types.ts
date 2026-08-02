import type { MatchStatus } from "@/lib/generated/prisma/enums";

/**
 * Tipos del módulo "Fútbol de hoy" — los partidos del mundo que trae
 * API-Football (`v3.football.api-sports.io`).
 *
 * Se separan en dos familias que **no** hay que confundir:
 *
 * - `ApiFootball*`: la forma **cruda** de la respuesta del proveedor. Cada campo
 *   es opcional a propósito: es JSON de un tercero, no un contrato que
 *   controlemos, y `lib/futbol-hoy/mapeo.ts` es el único autorizado a leerlo.
 * - El resto: la forma **nuestra**, ya validada, que viaja a la BD y a la UI.
 */

// ============================================================
// Respuesta cruda del proveedor
// ============================================================

/** Un partido tal como lo devuelve `GET /fixtures`. Nada es obligatorio acá. */
export interface ApiFootballFixture {
  fixture?: {
    id?: number;
    date?: string;
    status?: { short?: string; long?: string; elapsed?: number | null };
    venue?: { name?: string | null; city?: string | null };
  };
  league?: {
    id?: number;
    name?: string;
    country?: string | null;
    logo?: string | null;
    flag?: string | null;
    round?: string | null;
  };
  teams?: {
    home?: { id?: number; name?: string; logo?: string | null };
    away?: { id?: number; name?: string; logo?: string | null };
  };
  goals?: { home?: number | null; away?: number | null };
}

/**
 * Sobre de la respuesta. `errors` es el campo traicionero: **API-Football
 * responde 200 con `errors` poblado** cuando la clave es inválida o se agotó la
 * cuota, así que mirar solo el status HTTP da por buena una respuesta vacía.
 * Además cambia de forma según el caso (array vacío u objeto con motivos), por
 * eso está tipado como `unknown` y lo interpreta `hayErroresDeApi()`.
 */
export interface ApiFootballRespuesta {
  errors?: unknown;
  results?: number;
  paging?: { current?: number; total?: number };
  response?: ApiFootballFixture[];
}

// ============================================================
// Forma propia
// ============================================================

/**
 * Estado del partido. **Se reutiliza el enum `MatchStatus` del schema** en vez
 * de inventar un vocabulario paralelo: son los mismos siete estados que ya
 * entiende la app (y que ya tienen color en `MATCH_STATUS_COLORS`), así que la
 * UI de esta sección se lee igual que la de los partidos propios. La traducción
 * desde los códigos del proveedor vive en `estado.ts`.
 */
export type EstadoFixture = MatchStatus;

/** Fila lista para persistir: la salida del mapeo y la entrada del upsert. */
export interface FilaFixture {
  fixtureId: number;
  kickoff: Date;
  matchDay: string;
  statusShort: string;
  statusLong: string | null;
  elapsed: number | null;
  leagueId: number;
  leagueName: string;
  leagueCountry: string | null;
  leagueLogo: string | null;
  leagueFlag: string | null;
  leagueRound: string | null;
  homeTeamId: number;
  homeTeamName: string;
  homeTeamLogo: string | null;
  awayTeamId: number;
  awayTeamName: string;
  awayTeamLogo: string | null;
  homeGoals: number | null;
  awayGoals: number | null;
  venueName: string | null;
  venueCity: string | null;
}

/**
 * Partido tal como lo consume la UI. Es la fila más el estado ya traducido, y
 * las fechas como string ISO: este objeto cruza de server a cliente (props de
 * un Client Component y cuerpo de la API), donde un `Date` no sobrevive.
 */
export interface FixtureVista {
  fixtureId: number;
  kickoff: string;
  estado: EstadoFixture;
  /** Minuto de juego, solo si está en curso. */
  minuto: number | null;
  homeTeamName: string;
  homeTeamLogo: string | null;
  awayTeamName: string;
  awayTeamLogo: string | null;
  homeGoals: number | null;
  awayGoals: number | null;
  venueName: string | null;
  venueCity: string | null;
  leagueRound: string | null;
}

/** Un bloque de la página: una liga con sus partidos del día. */
export interface GrupoLiga {
  leagueId: number;
  leagueName: string;
  leagueCountry: string | null;
  leagueLogo: string | null;
  leagueFlag: string | null;
  /** Cuántos de estos partidos se están jugando ahora. */
  enVivo: number;
  partidos: FixtureVista[];
}

/** Lo que devuelve `GET /api/world-fixtures` y consume la página. */
export interface RespuestaFutbolHoy {
  /** Día consultado en hora de Argentina (`AAAA-MM-DD`). */
  matchDay: string;
  /**
   * Hoy en hora de Argentina. Viaja desde el server **a propósito**: si el
   * navegador lo calculara por su cuenta, el render del cliente podría no
   * coincidir con el del server (basta que el día cambie entre uno y otro) y
   * eso es un error de hidratación. Además, el "hoy" del sistema operativo del
   * visitante puede estar mal; el de la aplicación, no.
   */
  hoy: string;
  ligas: GrupoLiga[];
  totales: { partidos: number; enVivo: number; finalizados: number; ligas: number };
  /** ISO de la última copia exitosa desde el proveedor. Null = nunca hubo una. */
  actualizadoEn: string | null;
  /**
   * Por qué los datos podrían estar viejos, si es que lo están. Null = está al
   * día. La página lo muestra: un dato viejo sin avisar es peor que no tenerlo.
   */
  aviso: string | null;
}
