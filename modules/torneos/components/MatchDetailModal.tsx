"use client";

import { useState } from "react";
import Link from "next/link";
import {
  getMatchEvents,
  type MatchEvents,
} from "@modules/torneos/actions/getMatchEvents";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Eye,
  Target,
  Users,
  Trophy,
  Clock,
  MapPin,
  Calendar,
  ChevronRight,
} from "lucide-react";
import { IMatch } from "@modules/torneos/types/tournament-teams.types";
import { MatchStatus } from "@prisma/client";

interface MatchDetailModalProps {
  match: IMatch;
}

/** Evento del partido para la cronología (F2): gol o tarjeta con minuto */
interface TimelineEvent {
  id: string;
  minute: number | null;
  isHome: boolean;
  type: "goal" | "yellow" | "red";
  playerName: string;
  detail?: string;
}

// Función helper para formatear fecha
const formatMatchDate = (date: Date | string) => {
  const d = new Date(date);
  return d.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

// Función helper para formatear hora
const formatMatchTime = (date: Date | string) => {
  const d = new Date(date);
  return d.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const EMPTY_EVENTS: MatchEvents = { goals: [], cards: [], referees: [] };

export default function MatchDetailModal({ match }: MatchDetailModalProps) {
  const [open, setOpen] = useState(false);
  // Los eventos NO vienen con el partido (A3): se piden al abrir el modal.
  const [events, setEvents] = useState<MatchEvents>(EMPTY_EVENTS);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next && !loaded && !loading) {
      setLoading(true);
      getMatchEvents(match.id)
        .then((data) => {
          setEvents(data);
          setLoaded(true);
        })
        .catch(() => setEvents(EMPTY_EVENTS))
        .finally(() => setLoading(false));
    }
  };

  const homeScore = match.homeScore ?? 0;
  const awayScore = match.awayScore ?? 0;

  const goals = events.goals;
  const cards = events.cards;
  const referees = events.referees;

  // Cronología unificada (F2): goles + tarjetas ordenados por minuto,
  // local a la izquierda y visitante a la derecha
  const timeline: TimelineEvent[] = [
    ...goals.map(
      (g): TimelineEvent => ({
        id: `goal-${g.id}`,
        minute: g.minute ?? null,
        isHome: g.teamPlayer?.tournamentTeam?.id === match.homeTeamId,
        type: "goal",
        playerName: g.teamPlayer?.player?.name || "Desconocido",
        detail: g.isPenalty ? "Penal" : g.isOwnGoal ? "Autogol" : undefined,
      }),
    ),
    ...cards.map(
      (c): TimelineEvent => ({
        id: `card-${c.id}`,
        minute: c.minute ?? null,
        isHome: c.teamPlayer?.tournamentTeam?.id === match.homeTeamId,
        type: c.type === "ROJA" ? "red" : "yellow",
        playerName: c.teamPlayer?.player?.name || "Desconocido",
        detail: c.reason || undefined,
      }),
    ),
  ].sort((a, b) => (a.minute ?? 999) - (b.minute ?? 999));

  const getRefereeRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      PRINCIPAL: "Árbitro Principal",
      ASISTENTE_1: "Asistente 1",
      ASISTENTE_2: "Asistente 2",
      CUARTO_ARBITRO: "Cuarto Árbitro",
    };
    return roles[role] || role;
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-brand hover:text-brand hover:bg-brand/10"
        >
          <Eye className="w-4 h-4 mr-1" />
          Ver detalle
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            Detalle del Partido
          </DialogTitle>
        </DialogHeader>

        {/* Match Header */}
        <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
          {/* Fecha y estado */}
          <div className="flex items-center justify-between mb-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="capitalize">
                {formatMatchDate(match.dateTime)}
              </span>
              <Clock className="w-4 h-4 ml-2" />
              <span>{formatMatchTime(match.dateTime)}</span>
            </div>
            <Badge
              className={`rounded-full text-xs px-2.5 py-0.5 ${
                match.status === MatchStatus.FINALIZADO
                  ? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                  : match.status === MatchStatus.EN_JUEGO
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
              }`}
            >
              {match.status}
            </Badge>
          </div>

          {/* Teams and Score */}
          <div className="flex items-center justify-center gap-4">
            {/* Home Team */}
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-white dark:bg-gray-700 p-1 shadow-md">
                <img
                  src={match.homeTeam?.team?.logoUrl || "/placeholder.svg"}
                  alt={match.homeTeam?.team?.name || "Local"}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-semibold text-center text-gray-900 dark:text-white">
                {match.homeTeam?.team?.name || "Por definir"}
              </span>
            </div>

            {/* Score */}
            <div className="flex items-center gap-2">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">
                {homeScore}
              </span>
              <span className="text-2xl text-gray-400">-</span>
              <span className="text-4xl font-bold text-gray-900 dark:text-white">
                {awayScore}
              </span>
            </div>

            {/* Away Team */}
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-white dark:bg-gray-700 p-1 shadow-md">
                <img
                  src={match.awayTeam?.team?.logoUrl || "/placeholder.svg"}
                  alt={match.awayTeam?.team?.name || "Visitante"}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-semibold text-center text-gray-900 dark:text-white">
                {match.awayTeam?.team?.name || "Por definir"}
              </span>
            </div>
          </div>

          {/* Penalty info */}
          {match.penaltyWinnerTeamId && (
            <div className="mt-4 text-center">
              <Badge className="bg-brand/10 text-brand">
                <Trophy className="w-3 h-3 mr-1" />
                Penales: {match.penaltyScoreHome} - {match.penaltyScoreAway}
              </Badge>
            </div>
          )}

          {/* Venue */}
          {(match.stadium || match.city) && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <MapPin className="w-4 h-4" />
              <span>
                {[match.stadium, match.city].filter(Boolean).join(", ")}
              </span>
            </div>
          )}
        </div>

        {/* Tabs for Details */}
        <Tabs defaultValue="timeline" className="mt-4">
          <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            <TabsTrigger
              value="timeline"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 rounded-lg"
            >
              <Clock className="w-4 h-4 mr-2" />
              Cronología ({timeline.length})
            </TabsTrigger>
            <TabsTrigger
              value="referees"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 rounded-lg"
            >
              <Users className="w-4 h-4 mr-2" />
              Árbitros ({referees.length})
            </TabsTrigger>
          </TabsList>

          {/* Timeline Tab (F2): goles + tarjetas en orden cronológico,
              local a la izquierda / visitante a la derecha */}
          <TabsContent value="timeline" className="mt-4">
            {loading ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Clock className="w-12 h-12 mx-auto mb-2 opacity-50 animate-pulse" />
                <p>Cargando eventos…</p>
              </div>
            ) : timeline.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No hay eventos registrados</p>
              </div>
            ) : (
              <div className="relative py-2">
                {/* Encabezado de columnas */}
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 mb-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  <span className="text-right truncate">
                    {match.homeTeam?.team?.name || "Local"}
                  </span>
                  <span className="w-12" />
                  <span className="truncate">
                    {match.awayTeam?.team?.name || "Visitante"}
                  </span>
                </div>

                {/* Línea vertical central */}
                <div
                  aria-hidden="true"
                  className="absolute left-1/2 -translate-x-1/2 top-10 bottom-2 w-px bg-gradient-to-b from-brand/40 via-brand-2/40 to-transparent"
                />

                <div className="space-y-2">
                  {timeline.map((event) => {
                    const eventBody = (
                      <div
                        className={`inline-flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800 max-w-full ${
                          event.isHome ? "flex-row-reverse text-right" : ""
                        }`}
                      >
                        {event.type === "goal" ? (
                          <Target
                            className="w-4 h-4 shrink-0 text-green-600 dark:text-green-400"
                            aria-label="Gol"
                          />
                        ) : (
                          <span
                            className={`w-3 h-4 rounded-sm shrink-0 border border-black/10 shadow-sm ${
                              event.type === "red"
                                ? "bg-red-500"
                                : "bg-yellow-400"
                            }`}
                            aria-label={
                              event.type === "red"
                                ? "Tarjeta roja"
                                : "Tarjeta amarilla"
                            }
                          />
                        )}
                        <div className="min-w-0">
                          <span className="font-medium text-sm text-gray-900 dark:text-white block truncate">
                            {event.playerName}
                          </span>
                          {event.detail && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 block truncate">
                              {event.detail}
                            </span>
                          )}
                        </div>
                      </div>
                    );

                    return (
                      <div
                        key={event.id}
                        className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-2"
                      >
                        <div className="text-right min-w-0">
                          {event.isHome && eventBody}
                        </div>
                        <Badge
                          variant="outline"
                          className="w-12 justify-center bg-white dark:bg-gray-900 border-brand/30 text-brand font-bold shrink-0"
                        >
                          {event.minute != null ? `${event.minute}'` : "—"}
                        </Badge>
                        <div className="min-w-0">
                          {!event.isHome && eventBody}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Referees Tab */}
          <TabsContent value="referees" className="mt-4">
            {loading ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Clock className="w-12 h-12 mx-auto mb-2 opacity-50 animate-pulse" />
                <p>Cargando árbitros…</p>
              </div>
            ) : referees.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No hay árbitros asignados</p>
              </div>
            ) : (
              <div className="space-y-2">
                {referees.map((ref) => (
                  <div
                    key={ref.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand to-brand-mid flex items-center justify-center text-white font-bold">
                        {ref.referee?.name?.charAt(0) || "A"}
                      </div>
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {ref.referee?.name || "Desconocido"}
                        </span>
                        {ref.referee?.certificationLevel && (
                          <p className="text-xs text-gray-500">
                            {ref.referee.certificationLevel}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge className="bg-brand/10 text-brand">
                      {getRefereeRoleLabel(ref.role)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* El modal no tiene URL propia: para compartir o linkear el partido,
            la ficha pública es /partidos/[id]. */}
        <Button
          asChild
          variant="outline"
          className="mt-4 w-full border-brand/30 text-brand hover:bg-brand/10"
        >
          <Link href={`/partidos/${match.id}`}>
            Ver ficha completa del partido
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </Button>
      </DialogContent>
    </Dialog>
  );
}
