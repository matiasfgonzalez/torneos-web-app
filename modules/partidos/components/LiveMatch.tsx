"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Clock,
  Goal,
  MapPin,
  RectangleVertical,
  Shield,
  Trophy,
  Radio,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { SectionTitle } from "@/components/shared/PageHeader";
import { formatDate } from "@/lib/formatDate";
import { cn } from "@/lib/utils";
import { MatchStatus } from "@prisma/client";
import { IPartidos } from "@modules/partidos/types";
import { tournamentPublicPath } from "@modules/torneos/utils/publicPath";
import { useLivePoll } from "@/hooks/use-live-poll";
import {
  buildLiveState,
  isLiveStatus,
  type LiveEvent,
  type LiveMatchState,
} from "@modules/partidos/utils/liveState";

/** Un partido "jugado" ya tiene marcador que mostrar. */
const PLAYED_STATUSES: MatchStatus[] = [
  MatchStatus.EN_JUEGO,
  MatchStatus.ENTRETIEMPO,
  MatchStatus.FINALIZADO,
  MatchStatus.WALKOVER,
];

/** Cada cuánto refrescamos un partido en vivo (ms). */
const LIVE_POLL_MS = 15000;

function TeamSide({
  team,
  side,
}: Readonly<{ team: IPartidos["homeTeam"]; side: "Local" | "Visitante" }>) {
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

function EventIcon({ type }: Readonly<{ type: LiveEvent["type"] }>) {
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

/**
 * Marcador + cronología en vivo (S6). Recibe el partido del SSR y, mientras esté
 * EN_JUEGO/ENTRETIEMPO, refresca el estado desde `/api/matches/[id]/live` cada
 * pocos segundos. Cuando el partido termina, deja de pollear solo. La ficha
 * estática (árbitros, accesos) la sigue renderizando el server alrededor.
 */
export default function LiveMatch({
  initialMatch,
}: Readonly<{ initialMatch: IPartidos }>) {
  const [state, setState] = useState<LiveMatchState>(() =>
    buildLiveState(initialMatch),
  );

  // Ids presentes en el primer render: los que llegan después (por polling)
  // entran con una animación sutil; los iniciales no parpadean al cargar. Es
  // state (no ref) para poder leerlo en el render sin romper las reglas de hooks.
  const [initialEventIds] = useState(
    () => new Set(buildLiveState(initialMatch).events.map((e) => e.id)),
  );

  const live = isLiveStatus(state.status);

  const refresh = async () => {
    try {
      const res = await fetch(`/api/matches/${initialMatch.id}/live`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      const fresh: LiveMatchState = await res.json();
      setState(fresh);
    } catch {
      // Poll fallido (señal mala): reintenta en el próximo tick, sin romper nada.
    }
  };

  useLivePoll(refresh, LIVE_POLL_MS, live);

  const isPlayed = PLAYED_STATUSES.includes(state.status);
  const homeScore = state.homeScore ?? 0;
  const awayScore = state.awayScore ?? 0;

  const phaseLabel = [
    initialMatch.tournamentPhase?.name,
    initialMatch.roundNumber ? `Fecha ${initialMatch.roundNumber}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      {/* Marcador */}
      <Card className="relative overflow-hidden border-0 bg-white/80 shadow-xl backdrop-blur-xl dark:bg-gray-800/80">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-brand via-brand-mid to-brand-2" />
        <CardContent className="space-y-6 p-6 sm:p-8">
          {/* Barra "en vivo": pulso + minuto del último evento + auto-refresh */}
          {live && (
            <div className="flex items-center justify-center gap-2 rounded-xl bg-red-50 py-2 text-red-600 dark:bg-red-500/10 dark:text-red-400">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
              </span>
              <span className="text-sm font-bold uppercase tracking-wide">
                {state.status === MatchStatus.ENTRETIEMPO
                  ? "Entretiempo"
                  : "En vivo"}
                {state.currentMinute != null && ` · ${state.currentMinute}'`}
              </span>
              <Radio className="ml-1 h-3.5 w-3.5 opacity-70" aria-hidden="true" />
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-2">
            <StatusBadge entity="match" status={state.status} />
            <Link href={tournamentPublicPath(initialMatch.tournament)}>
              <Badge
                variant="outline"
                className="border-brand/30 text-brand transition-colors hover:bg-brand/10"
              >
                <Trophy className="mr-1 h-3 w-3" />
                {initialMatch.tournament.name}
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
            <TeamSide team={initialMatch.homeTeam} side="Local" />

            <div className="shrink-0 text-center">
              {isPlayed ? (
                <>
                  <div className="font-mono text-4xl font-bold text-gray-900 dark:text-white sm:text-6xl">
                    {homeScore}
                    <span className="mx-2 text-gray-300 dark:text-gray-600">
                      -
                    </span>
                    {awayScore}
                  </div>
                  {state.penaltyWinnerTeamId && (
                    <Badge className="mt-2 bg-brand/10 text-brand hover:bg-brand/10">
                      Penales {state.penaltyScoreHome ?? 0} -{" "}
                      {state.penaltyScoreAway ?? 0}
                    </Badge>
                  )}
                  {state.status === MatchStatus.WALKOVER && (
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

            <TeamSide team={initialMatch.awayTeam} side="Visitante" />
          </div>

          <div className="grid grid-cols-1 gap-3 border-t border-gray-100 pt-6 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-300 sm:grid-cols-3">
            <div className="flex items-center justify-center gap-2">
              <CalendarDays className="h-4 w-4 shrink-0 text-brand" />
              <span className="capitalize">
                {formatDate(initialMatch.dateTime, "EEEE d 'de' MMMM, yyyy")}
              </span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Clock className="h-4 w-4 shrink-0 text-brand-mid" />
              <span>{formatDate(initialMatch.dateTime, "HH:mm")} hs</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-brand-2" />
              <span className="truncate">
                {[initialMatch.stadium, initialMatch.city]
                  .filter(Boolean)
                  .join(" · ") || "Sede a confirmar"}
              </span>
            </div>
          </div>

          {initialMatch.description && (
            <p className="rounded-xl bg-gray-50 p-4 text-center text-sm text-gray-600 dark:bg-gray-900/40 dark:text-gray-300">
              {initialMatch.description}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Cronología */}
      <section className="mt-10 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <SectionTitle>Cronología</SectionTitle>
          {live && (
            <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
              Se actualiza sola
            </span>
          )}
        </div>

        <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-xl dark:bg-gray-800/80">
          <CardContent className="p-6">
            {state.events.length === 0 ? (
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
                {state.events.map((event) => {
                  const isNew = !initialEventIds.has(event.id);
                  return (
                    <li
                      key={event.id}
                      className={cn(
                        "flex items-center gap-3",
                        // Local a la izquierda, visitante a la derecha: se lee
                        // el partido de un vistazo, como en un diario deportivo.
                        event.side === "away" && "flex-row-reverse text-right",
                        isNew && "motion-safe:animate-slide-up",
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
                  );
                })}
              </ol>
            )}
          </CardContent>
        </Card>
      </section>
    </>
  );
}
