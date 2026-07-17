import { MatchStatus } from "@prisma/client";

/**
 * Estado "en vivo" de un partido (S6): la forma compacta que viaja del server al
 * cliente en cada poll. Es la MISMA que se construye para el render inicial (SSR)
 * y para el endpoint de polling — un solo builder, así la pantalla no cambia de
 * forma entre el primer render y las actualizaciones.
 */

export type LiveEventType = "goal" | "yellow" | "red";

export interface LiveEvent {
  id: string;
  minute: number | null;
  /** De qué lado del marcador va el evento (un autogol va para el rival). */
  side: "home" | "away";
  type: LiveEventType;
  playerId?: string;
  playerName: string;
  detail?: string;
}

export interface LiveMatchState {
  status: MatchStatus;
  homeScore: number | null;
  awayScore: number | null;
  penaltyWinnerTeamId: string | null;
  penaltyScoreHome: number | null;
  penaltyScoreAway: number | null;
  /** Minuto del último evento cargado (el "vamos por el…" honesto, sin reloj falso). */
  currentMinute: number | null;
  /** ISO de la última modificación del partido. */
  updatedAt: string;
  events: LiveEvent[];
}

/** EN_JUEGO y ENTRETIEMPO son los dos estados que ameritan seguir en vivo. */
export function isLiveStatus(status: string | null | undefined): boolean {
  return status === MatchStatus.EN_JUEGO || status === MatchStatus.ENTRETIEMPO;
}

/** Tarjeta compacta de un partido en vivo para el hub "En vivo ahora" (/partidos). */
export interface LiveMatchCard {
  id: string;
  status: MatchStatus;
  homeScore: number | null;
  awayScore: number | null;
  currentMinute: number | null;
  home: { name: string; shortName: string | null; logoUrl: string | null };
  away: { name: string; shortName: string | null; logoUrl: string | null };
  tournamentName: string;
}

// --- Entrada estructural: acepta tanto IPartidos como el select del endpoint ---

interface GoalInput {
  id: string;
  minute?: number | null;
  isOwnGoal?: boolean | null;
  isPenalty?: boolean | null;
  teamPlayer?: {
    player?: { id?: string | null; name?: string | null } | null;
    tournamentTeam?: { id?: string | null } | null;
  } | null;
  assistTeamPlayer?: { player?: { name?: string | null } | null } | null;
}

interface CardInput {
  id: string;
  minute?: number | null;
  type: string; // "AMARILLA" | "ROJA"
  reason?: string | null;
  teamPlayer?: {
    player?: { id?: string | null; name?: string | null } | null;
    tournamentTeam?: { id?: string | null } | null;
  } | null;
}

export interface MatchForLiveState {
  // `string` a propósito: acepta tanto el enum de Prisma como el enum nominal
  // de `@modules/partidos/types` (IPartidos), que TS trata como incompatibles
  // pese a tener los mismos valores. Se normaliza a MatchStatus en la salida.
  status: string;
  homeScore?: number | null;
  awayScore?: number | null;
  homeTeamId: string;
  penaltyWinnerTeamId?: string | null;
  penaltyScoreHome?: number | null;
  penaltyScoreAway?: number | null;
  updatedAt: Date | string;
  goals?: GoalInput[] | null;
  cards?: CardInput[] | null;
}

/**
 * Arma la cronología unificada (goles + tarjetas) ordenada por minuto. Los
 * eventos sin minuto van al final (no al minuto 0, que sería mentir). Misma
 * lógica que usaba `MatchDetailView`, ahora compartida entre SSR y polling.
 */
export function buildLiveState(match: MatchForLiveState): LiveMatchState {
  const goals = match.goals ?? [];
  const cards = match.cards ?? [];

  const goalEvents: LiveEvent[] = goals.map((g) => {
    const scoredForHome = g.teamPlayer?.tournamentTeam?.id === match.homeTeamId;
    return {
      id: `goal-${g.id}`,
      minute: g.minute ?? null,
      // Autogol: suma para el rival, así que va del lado contrario al del jugador.
      side: (g.isOwnGoal ? !scoredForHome : scoredForHome) ? "home" : "away",
      type: "goal",
      playerId: g.teamPlayer?.player?.id ?? undefined,
      playerName: g.teamPlayer?.player?.name ?? "Desconocido",
      detail:
        [
          g.isPenalty ? "Penal" : null,
          g.isOwnGoal ? "En contra" : null,
          g.assistTeamPlayer?.player?.name
            ? `Asistencia: ${g.assistTeamPlayer.player.name}`
            : null,
        ]
          .filter(Boolean)
          .join(" · ") || undefined,
    };
  });

  const cardEvents: LiveEvent[] = cards.map((c) => ({
    id: `card-${c.id}`,
    minute: c.minute ?? null,
    side: c.teamPlayer?.tournamentTeam?.id === match.homeTeamId ? "home" : "away",
    type: c.type === "ROJA" ? "red" : "yellow",
    playerId: c.teamPlayer?.player?.id ?? undefined,
    playerName: c.teamPlayer?.player?.name ?? "Desconocido",
    detail: c.reason || undefined,
  }));

  const events = [...goalEvents, ...cardEvents].sort(
    (a, b) => (a.minute ?? 999) - (b.minute ?? 999),
  );

  const minutes = events
    .map((e) => e.minute)
    .filter((m): m is number => m != null);
  const currentMinute = minutes.length ? Math.max(...minutes) : null;

  const updatedAt =
    match.updatedAt instanceof Date
      ? match.updatedAt.toISOString()
      : match.updatedAt;

  return {
    status: match.status as MatchStatus,
    homeScore: match.homeScore ?? null,
    awayScore: match.awayScore ?? null,
    penaltyWinnerTeamId: match.penaltyWinnerTeamId ?? null,
    penaltyScoreHome: match.penaltyScoreHome ?? null,
    penaltyScoreAway: match.penaltyScoreAway ?? null,
    currentMinute,
    updatedAt,
    events,
  };
}
