import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Goal,
  MapPin,
  RectangleVertical,
  Shield,
  Trophy,
  Users,
  Award,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { SectionTitle } from "@/components/shared/PageHeader";
import { formatDate } from "@/lib/formatDate";
import { cn } from "@/lib/utils";
import { IPartidos, MatchStatus } from "@modules/partidos/types";
import { tournamentPublicPath } from "@modules/torneos/utils/publicPath";

/**
 * Ficha pública de un partido (`/partidos/[id]`) — patrón §2 de
 * docs/UI_PATTERNS.md (detalle público).
 *
 * Es la vista "de hincha": marcador, cronología de goles y tarjetas, plantel de
 * árbitros y accesos a los dos equipos y al torneo. Todo lo editable vive en el
 * panel (`/admin/partidos/[id]/cargar`), acá no hay ninguna acción de escritura.
 */

interface TimelineEvent {
  id: string;
  minute: number | null;
  isHome: boolean;
  type: "goal" | "yellow" | "red";
  playerId?: string;
  playerName: string;
  detail?: string;
}

/** Un partido "jugado" ya tiene marcador que mostrar. */
const PLAYED_STATUSES: MatchStatus[] = [
  MatchStatus.EN_JUEGO,
  MatchStatus.ENTRETIEMPO,
  MatchStatus.FINALIZADO,
  MatchStatus.WALKOVER,
];

const REFEREE_ROLE_LABELS: Record<string, string> = {
  PRINCIPAL: "Árbitro principal",
  ASISTENTE_1: "Asistente 1",
  ASISTENTE_2: "Asistente 2",
  CUARTO_ARBITRO: "Cuarto árbitro",
};

function TeamSide({
  team,
  side,
}: Readonly<{
  team: IPartidos["homeTeam"];
  side: "Local" | "Visitante";
}>) {
  return (
    <Link
      href={`/equipos/${team.team.id}`}
      className="group flex flex-1 flex-col items-center gap-3 rounded-2xl p-3 transition-colors hover:bg-white/60 dark:hover:bg-gray-800/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
    >
      <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-2 border-white bg-gray-50 shadow-lg dark:border-gray-700 dark:bg-gray-700 sm:h-24 sm:w-24">
        {team.team.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={team.team.logoUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <Shield className="h-10 w-10 text-gray-400" />
        )}
      </div>
      <div className="text-center">
        <p className="font-bold text-gray-900 group-hover:text-brand dark:text-white sm:text-lg">
          {team.team.name}
        </p>
        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {side}
        </p>
      </div>
    </Link>
  );
}

function EventIcon({ type }: Readonly<{ type: TimelineEvent["type"] }>) {
  if (type === "goal") {
    return (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand dark:bg-brand/20">
        <Goal className="h-4 w-4" />
      </span>
    );
  }
  return (
    <span
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
        type === "red"
          ? "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400"
          : "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
      )}
    >
      <RectangleVertical className="h-4 w-4 fill-current" />
    </span>
  );
}

export default function MatchDetailView({
  match,
}: Readonly<{ match: IPartidos }>) {
  const isPlayed = PLAYED_STATUSES.includes(match.status);
  const isLive =
    match.status === MatchStatus.EN_JUEGO ||
    match.status === MatchStatus.ENTRETIEMPO;

  const goals = match.goals ?? [];
  const cards = match.cards ?? [];
  const referees = match.referees ?? [];

  // Cronología unificada: goles + tarjetas por minuto. Los eventos sin minuto
  // cargado van al final (no al minuto 0, que sería mentir).
  const timeline: TimelineEvent[] = [
    ...goals.map((g): TimelineEvent => {
      const scoredForHome =
        g.teamPlayer?.tournamentTeam?.id === match.homeTeamId;
      return {
        id: `goal-${g.id}`,
        minute: g.minute ?? null,
        // Un autogol se cuenta para el rival: va del lado del equipo al que le
        // sumó el gol, no del lado del jugador que lo hizo.
        isHome: g.isOwnGoal ? !scoredForHome : scoredForHome,
        type: "goal",
        playerId: g.teamPlayer?.player?.id,
        playerName: g.teamPlayer?.player?.name ?? "Desconocido",
        detail: [
          g.isPenalty ? "Penal" : null,
          g.isOwnGoal ? "En contra" : null,
          g.assistTeamPlayer
            ? `Asistencia: ${g.assistTeamPlayer.player.name}`
            : null,
        ]
          .filter(Boolean)
          .join(" · "),
      };
    }),
    ...cards.map(
      (c): TimelineEvent => ({
        id: `card-${c.id}`,
        minute: c.minute ?? null,
        isHome: c.teamPlayer?.tournamentTeam?.id === match.homeTeamId,
        type: c.type === "ROJA" ? "red" : "yellow",
        playerId: c.teamPlayer?.player?.id,
        playerName: c.teamPlayer?.player?.name ?? "Desconocido",
        detail: c.reason || undefined,
      }),
    ),
  ].sort((a, b) => (a.minute ?? 999) - (b.minute ?? 999));

  const phaseLabel = [
    match.tournamentPhase?.name,
    match.roundNumber ? `Fecha ${match.roundNumber}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="min-h-screen premium-gradient-bg">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <Button
          variant="ghost"
          asChild
          className="mb-6 -ml-2 text-gray-600 hover:text-brand dark:text-gray-300"
        >
          <Link href="/partidos">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Todos los partidos
          </Link>
        </Button>

        {/* Marcador */}
        <Card className="relative overflow-hidden border-0 bg-white/80 shadow-xl backdrop-blur-xl dark:bg-gray-800/80">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-brand via-brand-mid to-brand-2" />
          <CardContent className="space-y-6 p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <StatusBadge entity="match" status={match.status} />
              <Link href={tournamentPublicPath(match.tournament)}>
                <Badge
                  variant="outline"
                  className="border-brand/30 text-brand transition-colors hover:bg-brand/10"
                >
                  <Trophy className="mr-1 h-3 w-3" />
                  {match.tournament.name}
                </Badge>
              </Link>
              {phaseLabel && (
                <Badge
                  variant="outline"
                  className="border-gray-200 text-gray-600 dark:border-gray-600 dark:text-gray-300"
                >
                  {phaseLabel}
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 sm:gap-6">
              <TeamSide team={match.homeTeam} side="Local" />

              <div className="shrink-0 text-center">
                {isPlayed ? (
                  <>
                    <div className="font-mono text-4xl font-bold text-gray-900 dark:text-white sm:text-6xl">
                      {match.homeScore ?? 0}
                      <span className="mx-2 text-gray-300 dark:text-gray-600">
                        -
                      </span>
                      {match.awayScore ?? 0}
                    </div>
                    {isLive && (
                      <p className="mt-1 animate-pulse text-xs font-semibold uppercase tracking-wide text-red-600 dark:text-red-400">
                        En vivo
                      </p>
                    )}
                    {match.penaltyWinnerTeamId && (
                      <Badge className="mt-2 bg-brand/10 text-brand hover:bg-brand/10">
                        Penales {match.penaltyScoreHome ?? 0} -{" "}
                        {match.penaltyScoreAway ?? 0}
                      </Badge>
                    )}
                    {match.status === MatchStatus.WALKOVER && (
                      <Badge className="mt-2 bg-purple-100 text-purple-700 hover:bg-purple-100 dark:bg-purple-500/20 dark:text-purple-300">
                        Walkover
                      </Badge>
                    )}
                  </>
                ) : (
                  <div className="rounded-full bg-gray-100 px-4 py-2 text-lg font-bold text-gray-400 dark:bg-gray-700">
                    VS
                  </div>
                )}
              </div>

              <TeamSide team={match.awayTeam} side="Visitante" />
            </div>

            <div className="grid grid-cols-1 gap-3 border-t border-gray-100 pt-6 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-300 sm:grid-cols-3">
              <div className="flex items-center justify-center gap-2">
                <CalendarDays className="h-4 w-4 shrink-0 text-brand" />
                <span className="capitalize">
                  {formatDate(match.dateTime, "EEEE d 'de' MMMM, yyyy")}
                </span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Clock className="h-4 w-4 shrink-0 text-brand-mid" />
                <span>{formatDate(match.dateTime, "HH:mm")} hs</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-brand-2" />
                <span className="truncate">
                  {[match.stadium, match.city].filter(Boolean).join(" · ") ||
                    "Sede a confirmar"}
                </span>
              </div>
            </div>

            {match.description && (
              <p className="rounded-xl bg-gray-50 p-4 text-center text-sm text-gray-600 dark:bg-gray-900/40 dark:text-gray-300">
                {match.description}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Cronología */}
        <section className="mt-10 space-y-4">
          <SectionTitle>Cronología</SectionTitle>

          <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-xl dark:bg-gray-800/80">
            <CardContent className="p-6">
              {timeline.length === 0 ? (
                <EmptyState
                  icon={Goal}
                  title={
                    isPlayed
                      ? "Sin goles ni tarjetas"
                      : "El partido todavía no se jugó"
                  }
                  description={
                    isPlayed
                      ? "No se registraron eventos en este partido."
                      : "Cuando arranque vas a ver acá los goles y las tarjetas, minuto a minuto."
                  }
                />
              ) : (
                <ol className="space-y-3">
                  {timeline.map((event) => (
                    <li
                      key={event.id}
                      className={cn(
                        "flex items-center gap-3",
                        // Local a la izquierda, visitante a la derecha: se lee
                        // el partido de un vistazo, como en un diario deportivo.
                        !event.isHome && "flex-row-reverse text-right",
                      )}
                    >
                      <span className="w-10 shrink-0 text-center font-mono text-sm font-semibold text-gray-400 dark:text-gray-500">
                        {event.minute != null ? `${event.minute}'` : "—"}
                      </span>
                      <EventIcon type={event.type} />
                      <div className="min-w-0">
                        {event.playerId ? (
                          <Link
                            href={`/jugadores/${event.playerId}`}
                            className="truncate font-semibold text-gray-900 hover:text-brand dark:text-white"
                          >
                            {event.playerName}
                          </Link>
                        ) : (
                          <p className="truncate font-semibold text-gray-900 dark:text-white">
                            {event.playerName}
                          </p>
                        )}
                        {event.detail && (
                          <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                            {event.detail}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Árbitros */}
        {referees.length > 0 && (
          <section className="mt-10 space-y-4">
            <SectionTitle>Terna arbitral</SectionTitle>
            <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-xl dark:bg-gray-800/80">
              <CardContent className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
                {referees.map((r) => (
                  <div key={r.id} className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand dark:bg-brand/20">
                      <Award className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-gray-900 dark:text-white">
                        {r.referee.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {REFEREE_ROLE_LABELS[r.role] ?? r.role}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>
        )}

        {/* Accesos */}
        <section className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Button variant="outline" asChild className="h-12 justify-start">
            <Link href={`/equipos/${match.homeTeam.team.id}`}>
              <Users className="mr-2 h-4 w-4 text-brand" />
              <span className="truncate">{match.homeTeam.team.name}</span>
            </Link>
          </Button>
          <Button variant="outline" asChild className="h-12 justify-start">
            <Link href={`/equipos/${match.awayTeam.team.id}`}>
              <Users className="mr-2 h-4 w-4 text-brand" />
              <span className="truncate">{match.awayTeam.team.name}</span>
            </Link>
          </Button>
          <Button variant="outline" asChild className="h-12 justify-start">
            <Link href={tournamentPublicPath(match.tournament)}>
              <Trophy className="mr-2 h-4 w-4 text-brand" />
              <span className="truncate">{match.tournament.name}</span>
            </Link>
          </Button>
        </section>
      </div>
    </div>
  );
}
