import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Target,
  Shield,
  Trophy,
  Calendar,
  ChevronRight,
  MapPin,
  Clock,
  Swords,
  BarChart3,
  Medal,
  CalendarClock,
  ShieldAlert,
} from "lucide-react";

import { getTorneoById } from "@modules/torneos/actions/getTorneoById";
import { getTournamentCanonicalPath } from "@modules/torneos/actions/getTorneoBySlug";
import { getTournamentStats } from "@modules/torneos/actions/getTournamentStats";
import { getAdvancedStats } from "@modules/torneos/actions/getAdvancedStats";
import { ShareButton } from "@modules/torneos/components/ShareButton";
import { ExportMenu } from "@modules/torneos/components/ExportMenu";
import { AdvancedStats } from "@modules/torneos/components/stats/AdvancedStats";
import { HeadToHead } from "@modules/torneos/components/stats/HeadToHead";
import { getTournamentSuspensions } from "@modules/torneos/actions/suspensions";
import { hasFeature } from "@/lib/planLimits";
import { SuspensionsList } from "@modules/torneos/components/SuspensionsList";
import { notFound } from "next/navigation";
import HeaderTorneo from "@modules/torneos/components/HeaderTorneo";
import { checkUser } from "@/lib/checkUser";
import { getFavoritedIds } from "@modules/favoritos/actions/favorites";
import { FollowButton } from "@modules/favoritos/components/FollowButton";
import TeamsCarousel from "@modules/equipos/components/TeamsCarousel";
import PublicStandingsSection from "@modules/torneos/components/PublicStandingsSection";
import MatchDetailModal from "@modules/torneos/components/MatchDetailModal";
import { MatchStatus } from "@prisma/client";
import {
  ITournamentTeam,
  IMatch,
} from "@modules/torneos/types/tournament-teams.types";

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

// Estados que indican que el partido aún no se jugó
const UPCOMING_STATUSES: Set<MatchStatus> = new Set([
  MatchStatus.PROGRAMADO,
  MatchStatus.POSTERGADO,
]);

// Estados que indican que el partido ya se jugó o está en juego
const PLAYED_STATUSES: Set<MatchStatus> = new Set([
  MatchStatus.EN_JUEGO,
  MatchStatus.ENTRETIEMPO,
  MatchStatus.FINALIZADO,
  MatchStatus.SUSPENDIDO,
  MatchStatus.CANCELADO,
  MatchStatus.WALKOVER,
]);

// Función helper para obtener el label del estado en español
const getStatusLabel = (status: MatchStatus): string => {
  const labels: Record<MatchStatus, string> = {
    [MatchStatus.PROGRAMADO]: "Programado",
    [MatchStatus.EN_JUEGO]: "En Juego",
    [MatchStatus.ENTRETIEMPO]: "Entretiempo",
    [MatchStatus.FINALIZADO]: "Finalizado",
    [MatchStatus.SUSPENDIDO]: "Suspendido",
    [MatchStatus.POSTERGADO]: "Postergado",
    [MatchStatus.CANCELADO]: "Cancelado",
    [MatchStatus.WALKOVER]: "Walkover",
  };
  return labels[status] || status;
};

// Función helper para obtener el color del badge según el estado
const getStatusColor = (status: MatchStatus): string => {
  switch (status) {
    case MatchStatus.EN_JUEGO:
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 animate-pulse";
    case MatchStatus.ENTRETIEMPO:
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
    case MatchStatus.FINALIZADO:
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    case MatchStatus.SUSPENDIDO:
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    case MatchStatus.CANCELADO:
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    case MatchStatus.WALKOVER:
      return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
  }
};

/**
 * Vista de detalle público de un torneo (N9). Recibe el `id` ya resuelto y se
 * renderiza tanto desde `/torneos/[id]` (UUID legacy) como desde la URL
 * canónica `/liga/[orgSlug]/[torneoSlug]`.
 */
export default async function TournamentDetailView({
  id,
}: Readonly<{ id: string }>) {
  const [
    tournamentData,
    stats,
    advancedStats,
    suspensions,
    user,
    favoritedIds,
    canonicalPath,
  ] = await Promise.all([
    getTorneoById(id),
    getTournamentStats(id),
    getAdvancedStats(id),
    getTournamentSuspensions(id),
    checkUser(),
    getFavoritedIds(),
    // `/liga/[slug]/[torneo]` si el torneo tiene slug; null si todavía no.
    getTournamentCanonicalPath(id),
  ]);

  if (!tournamentData) return notFound();

  // Exportar (S8) es feature de plan: solo se ofrece si la liga la tiene.
  const canExport = await hasFeature(
    tournamentData.organizationId,
    "exportPdf",
  );

  // Para compartir sirve cualquier ruta pública; el QR solo la canónica (su
  // cartel vive bajo `/liga/...`). Sin slug se comparte la URL por id igual.
  const sharePath = canonicalPath ?? `/torneos/${id}`;

  // Filtrar partidos próximos (no jugados)
  const upcomingMatches =
    tournamentData.matches?.filter((match) =>
      UPCOMING_STATUSES.has(match.status as MatchStatus),
    ) || [];

  // Filtrar partidos jugados o en juego (ordenados del más reciente al más antiguo)
  const playedMatches =
    tournamentData.matches
      ?.filter((match) => PLAYED_STATUSES.has(match.status as MatchStatus))
      .sort(
        (a, b) =>
          new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime(),
      ) || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
          <Link href="/" className="hover:text-brand transition-colors">
            Inicio
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link
            href="/torneos"
            className="hover:text-brand transition-colors"
          >
            Torneos
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 dark:text-white font-medium truncate max-w-[200px]">
            {tournamentData.name}
          </span>
        </nav>

        {/* Back Button - Premium Style */}
        <Button
          variant="ghost"
          className="mb-6 hover:bg-brand/10 hover:text-brand border border-gray-200 dark:border-gray-700"
          asChild
        >
          <Link href="/torneos">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a torneos
          </Link>
        </Button>

        {/* Tournament Header */}
        <HeaderTorneo
          tournamentData={tournamentData}
          shareButton={
            <>
              {canExport && <ExportMenu tournamentId={tournamentData.id} />}
              <ShareButton
                canonicalPath={sharePath}
                qrPath={canonicalPath ? `${canonicalPath}/qr` : null}
                tournamentName={tournamentData.name}
              />
            </>
          }
          followButton={
            <FollowButton
              type="tournament"
              id={tournamentData.id}
              initialFavorited={favoritedIds.tournamentIds.has(tournamentData.id)}
              isLoggedIn={!!user}
              variant="hero"
            />
          }
        />

        {/* Teams Carousel */}
        {tournamentData.tournamentTeams &&
          tournamentData.tournamentTeams.length > 0 && (
            <div className="mb-10">
              <TeamsCarousel tournamentTeams={tournamentData.tournamentTeams} />
            </div>
          )}

        {/* Tournament Content Tabs - Premium Golazo Style */}
        <Tabs defaultValue="standings" className="space-y-8">
          {/* Premium Tab List — sticky en mobile (F2): el header público mide
              h-16 + barra de 4px, las tabs quedan pegadas debajo al scrollear */}
          <div className="sticky top-[72px] z-30 lg:relative lg:top-auto">
            <div className="absolute -inset-1 bg-gradient-to-r from-brand via-brand-mid to-brand-2 rounded-2xl blur opacity-20" />
            <TabsList className="relative flex flex-wrap sm:grid sm:grid-cols-2 lg:grid-cols-4 w-full bg-white dark:bg-gray-900 p-2 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 gap-2 h-auto">
              <TabsTrigger
                value="standings"
                className="flex-1 min-w-[calc(50%-0.5rem)] sm:min-w-0 data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand data-[state=active]:to-brand-mid data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-brand/25 rounded-xl py-3 px-3 font-medium transition-all duration-300 text-sm sm:text-base"
              >
                <Trophy className="w-4 h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                <span className="truncate">Posiciones</span>
              </TabsTrigger>
              <TabsTrigger
                value="fixtures"
                className="flex-1 min-w-[calc(50%-0.5rem)] sm:min-w-0 data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand data-[state=active]:to-brand-mid data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-brand/25 rounded-xl py-3 px-3 font-medium transition-all duration-300 text-sm sm:text-base"
              >
                <Calendar className="w-4 h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                <span className="truncate">Calendario</span>
              </TabsTrigger>
              <TabsTrigger
                value="results"
                className="flex-1 min-w-[calc(50%-0.5rem)] sm:min-w-0 data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand data-[state=active]:to-brand-mid data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-brand/25 rounded-xl py-3 px-3 font-medium transition-all duration-300 text-sm sm:text-base"
              >
                <Swords className="w-4 h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                <span className="truncate">Resultados</span>
              </TabsTrigger>
              <TabsTrigger
                value="stats"
                className="flex-1 min-w-[calc(50%-0.5rem)] sm:min-w-0 data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand data-[state=active]:to-brand-mid data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-brand/25 rounded-xl py-3 px-3 font-medium transition-all duration-300 text-sm sm:text-base"
              >
                <BarChart3 className="w-4 h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                <span className="truncate">Estadísticas</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Standings Tab - Premium Golazo Style */}
          <TabsContent value="standings">
            <PublicStandingsSection
              tournamentTeams={
                (tournamentData.tournamentTeams as ITournamentTeam[]) || []
              }
              matches={(tournamentData.matches || []) as IMatch[]}
              tournamentFormat={tournamentData.format}
              tiebreakers={tournamentData.tiebreakers}
            />
          </TabsContent>

          {/* Fixtures Tab - Premium Golazo Style */}
          <TabsContent value="fixtures">
            <Card className="relative bg-white dark:bg-gray-900/80 shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden rounded-2xl backdrop-blur-sm">
              {/* Gradient accent bar */}
              <div className="h-1.5 bg-gradient-to-r from-brand via-brand-mid to-brand-2" />
              <CardHeader className="border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/25">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-gray-900 dark:text-white text-xl">
                        Próximos Partidos
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        Calendario de los próximos encuentros
                      </CardDescription>
                    </div>
                  </div>
                  {upcomingMatches.length > 0 && (
                    <Badge className="bg-brand/10 text-brand border-brand/20 rounded-full px-3 py-1">
                      {upcomingMatches.length} partido
                      {upcomingMatches.length === 1 ? "" : "s"}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {upcomingMatches.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                      <CalendarClock className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No hay partidos programados
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                      Aún no se han programado partidos para este torneo. Vuelve
                      pronto para ver el calendario actualizado.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingMatches.map((match) => (
                      <div
                        key={match.id}
                        className="group relative bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 hover:border-brand/50 hover:shadow-xl hover:shadow-brand/10 transition-all duration-300"
                      >
                        {/* Subtle gradient overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-brand/0 via-brand/0 to-brand-mid/0 group-hover:from-brand/5 group-hover:via-brand/3 group-hover:to-brand-mid/5 rounded-2xl transition-all duration-300" />

                        <div className="relative">
                          {/* Status & Phase badges */}
                          <div className="flex flex-wrap items-center gap-2 mb-4">
                            <Badge
                              className={`rounded-full text-xs px-2.5 py-0.5 ${
                                match.status === "PROGRAMADO"
                                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                  : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                              }`}
                            >
                              {match.status === "PROGRAMADO"
                                ? "Programado"
                                : "Postergado"}
                            </Badge>
                            {/* El nombre de la fase ya viene legible desde la
                                base ("Cuartos de final"): esta cadena de 9
                                ternarios traducía nombres del enum del modelo
                                `Phase` legacy, borrado en A6 — y como el campo
                                nunca llegaba, el badge no se mostraba nunca. */}
                            {match.tournamentPhase && (
                              <Badge className="bg-brand/10 text-brand border-0 rounded-full text-xs px-2.5 py-0.5">
                                {match.tournamentPhase.name}
                                {match.roundNumber
                                  ? ` · Fecha ${match.roundNumber}`
                                  : ""}
                              </Badge>
                            )}
                          </div>

                          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                            {/* Date & Time */}
                            <div className="flex flex-col items-center lg:items-start gap-1 min-w-[140px]">
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Calendar className="w-4 h-4" />
                                <span className="capitalize">
                                  {formatMatchDate(match.dateTime)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 font-bold text-lg text-brand">
                                <Clock className="w-4 h-4" />
                                {formatMatchTime(match.dateTime)}
                              </div>
                            </div>

                            {/* Match Teams */}
                            <div className="flex items-center gap-3 sm:gap-6 flex-1 justify-center py-2">
                              {/* Home Team */}
                              <div className="flex flex-col sm:flex-row items-center gap-3 flex-1 justify-end">
                                <span className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg group-hover:text-brand transition-colors text-center sm:text-right order-2 sm:order-1">
                                  {match.homeTeam?.team?.name || "Por definir"}
                                </span>
                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 p-0.5 shadow-md order-1 sm:order-2">
                                  <img
                                    src={
                                      match.homeTeam?.team?.logoUrl ||
                                      "/placeholder.svg"
                                    }
                                    alt={
                                      match.homeTeam?.team?.name ||
                                      "Equipo local"
                                    }
                                    className="w-full h-full object-cover rounded-lg"
                                  />
                                </div>
                              </div>

                              {/* VS Badge */}
                              <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-brand to-brand-mid shadow-lg shadow-brand/25">
                                <span className="font-bold text-white text-sm">
                                  VS
                                </span>
                              </div>

                              {/* Away Team */}
                              <div className="flex flex-col sm:flex-row items-center gap-3 flex-1 justify-start">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 p-0.5 shadow-md">
                                  <img
                                    src={
                                      match.awayTeam?.team?.logoUrl ||
                                      "/placeholder.svg"
                                    }
                                    alt={
                                      match.awayTeam?.team?.name ||
                                      "Equipo visitante"
                                    }
                                    className="w-full h-full object-cover rounded-lg"
                                  />
                                </div>
                                <span className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg group-hover:text-brand transition-colors text-center sm:text-left">
                                  {match.awayTeam?.team?.name || "Por definir"}
                                </span>
                              </div>
                            </div>

                            {/* Venue */}
                            <div className="flex flex-col items-center lg:items-end gap-1 min-w-[150px]">
                              {match.stadium && (
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                  <MapPin className="w-4 h-4 text-brand" />
                                  <span className="font-medium">
                                    {match.stadium}
                                  </span>
                                </div>
                              )}
                              {match.city && (
                                <span className="text-xs text-gray-500 dark:text-gray-500">
                                  {match.city}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Ficha del partido: en "Próximos" no hay modal de
                              detalle (todavía no hay eventos que mostrar), pero
                              la ficha sí existe y es linkeable. */}
                          <div className="mt-4 flex justify-center">
                            <Link
                              href={`/partidos/${match.id}`}
                              className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:text-brand-mid transition-colors"
                            >
                              Ver partido
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Results Tab - Premium Golazo Style */}
          <TabsContent value="results">
            <Card className="relative bg-white dark:bg-gray-900/80 shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden rounded-2xl backdrop-blur-sm">
              {/* Gradient accent bar */}
              <div className="h-1.5 bg-gradient-to-r from-brand via-brand-mid to-brand-2" />
              <CardHeader className="border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg shadow-green-500/25">
                      <Swords className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-gray-900 dark:text-white text-xl">
                        Resultados
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        Partidos disputados y en juego
                      </CardDescription>
                    </div>
                  </div>
                  {playedMatches.length > 0 && (
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0 rounded-full px-3 py-1">
                      {playedMatches.length} partido
                      {playedMatches.length === 1 ? "" : "s"}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {playedMatches.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                      <Swords className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No hay resultados aún
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                      Todavía no se han disputado partidos en este torneo. Los
                      resultados aparecerán aquí una vez que comiencen los
                      encuentros.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {playedMatches.map((match) => {
                      const homeScore = match.homeScore ?? 0;
                      const awayScore = match.awayScore ?? 0;
                      const isHomeWinner = homeScore > awayScore;
                      const isAwayWinner = awayScore > homeScore;
                      const isDraw = homeScore === awayScore;
                      const isLive =
                        match.status === MatchStatus.EN_JUEGO ||
                        match.status === MatchStatus.ENTRETIEMPO;

                      return (
                        <div
                          key={match.id}
                          className={`group relative bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl p-5 border ${
                            isLive
                              ? "border-green-400 dark:border-green-500 shadow-lg shadow-green-500/10"
                              : "border-gray-100 dark:border-gray-700"
                          } hover:border-brand/50 hover:shadow-xl hover:shadow-brand/10 transition-all duration-300`}
                        >
                          {/* Subtle gradient overlay on hover */}
                          <div className="absolute inset-0 bg-gradient-to-r from-brand/0 via-brand/0 to-brand-mid/0 group-hover:from-brand/5 group-hover:via-brand/3 group-hover:to-brand-mid/5 rounded-2xl transition-all duration-300" />

                          {/* Live indicator pulse */}
                          {isLive && (
                            <div className="absolute top-3 right-3">
                              <span className="flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                              </span>
                            </div>
                          )}

                          <div className="relative">
                            {/* Date & Status badges */}
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Calendar className="w-4 h-4" />
                                <span className="capitalize">
                                  {formatMatchDate(match.dateTime)}
                                </span>
                              </div>
                              <Badge
                                className={`rounded-full text-xs px-2.5 py-0.5 uppercase tracking-wider ${getStatusColor(match.status as MatchStatus)}`}
                              >
                                {getStatusLabel(match.status as MatchStatus)}
                              </Badge>
                            </div>

                            <div className="flex flex-col lg:flex-row items-center justify-center gap-4">
                              {/* Home Team */}
                              <div className="flex flex-col sm:flex-row items-center gap-3 flex-1 justify-end">
                                <span
                                  className={`font-semibold text-base sm:text-lg transition-colors text-center sm:text-right order-2 sm:order-1 ${
                                    isHomeWinner
                                      ? "text-green-600 dark:text-green-400"
                                      : "text-gray-900 dark:text-white group-hover:text-brand"
                                  }`}
                                >
                                  {match.homeTeam?.team?.name || "Por definir"}
                                </span>
                                <div
                                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden p-0.5 shadow-md order-1 sm:order-2 ${
                                    isHomeWinner
                                      ? "bg-gradient-to-br from-green-400 to-emerald-500 ring-2 ring-green-400/50"
                                      : "bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800"
                                  }`}
                                >
                                  <img
                                    src={
                                      match.homeTeam?.team?.logoUrl ||
                                      "/placeholder.svg"
                                    }
                                    alt={
                                      match.homeTeam?.team?.name ||
                                      "Equipo local"
                                    }
                                    className="w-full h-full object-cover rounded-lg bg-white dark:bg-gray-900"
                                  />
                                </div>
                              </div>

                              {/* Score Box */}
                              <div className="flex items-center gap-2 sm:gap-3">
                                <div
                                  className={`flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl font-bold text-xl sm:text-2xl shadow-lg ${
                                    isHomeWinner
                                      ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-green-500/25"
                                      : isDraw
                                        ? "bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-yellow-500/25"
                                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                                  }`}
                                >
                                  {homeScore}
                                </div>
                                <div className="flex flex-col items-center">
                                  <span className="text-gray-400 dark:text-gray-500 font-bold text-lg">
                                    -
                                  </span>
                                </div>
                                <div
                                  className={`flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl font-bold text-xl sm:text-2xl shadow-lg ${
                                    isAwayWinner
                                      ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-green-500/25"
                                      : isDraw
                                        ? "bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-yellow-500/25"
                                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                                  }`}
                                >
                                  {awayScore}
                                </div>
                              </div>

                              {/* Away Team */}
                              <div className="flex flex-col sm:flex-row items-center gap-3 flex-1 justify-start">
                                <div
                                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden p-0.5 shadow-md ${
                                    isAwayWinner
                                      ? "bg-gradient-to-br from-green-400 to-emerald-500 ring-2 ring-green-400/50"
                                      : "bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800"
                                  }`}
                                >
                                  <img
                                    src={
                                      match.awayTeam?.team?.logoUrl ||
                                      "/placeholder.svg"
                                    }
                                    alt={
                                      match.awayTeam?.team?.name ||
                                      "Equipo visitante"
                                    }
                                    className="w-full h-full object-cover rounded-lg bg-white dark:bg-gray-900"
                                  />
                                </div>
                                <span
                                  className={`font-semibold text-base sm:text-lg transition-colors text-center sm:text-left ${
                                    isAwayWinner
                                      ? "text-green-600 dark:text-green-400"
                                      : "text-gray-900 dark:text-white group-hover:text-brand"
                                  }`}
                                >
                                  {match.awayTeam?.team?.name || "Por definir"}
                                </span>
                              </div>
                            </div>

                            {/* Penalty info if exists */}
                            {match.penaltyWinnerTeamId && (
                              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                                <div className="flex items-center justify-center gap-2 text-sm">
                                  <Trophy className="w-4 h-4 text-brand" />
                                  <span className="text-gray-600 dark:text-gray-400">
                                    Penales: {match.penaltyScoreHome} -{" "}
                                    {match.penaltyScoreAway}
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Venue info */}
                            {(match.stadium || match.city) && (
                              <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                                <MapPin className="w-3 h-3" />
                                <span>
                                  {[match.stadium, match.city]
                                    .filter(Boolean)
                                    .join(", ")}
                                </span>
                              </div>
                            )}

                            {/* Ver detalle button */}
                            <div className="mt-4 flex justify-center">
                              <MatchDetailModal match={match as IMatch} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statistics Tab - Premium Golazo Style */}
          <TabsContent value="stats">
            {/* Stats Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card className="bg-white dark:bg-gray-900/80 border border-gray-100 dark:border-gray-800 rounded-xl">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br from-brand to-brand-mid flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalGoals}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Goles Totales
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-gray-900/80 border border-gray-100 dark:border-gray-800 rounded-xl">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <Swords className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalMatches}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Partidos Jugados
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-gray-900/80 border border-gray-100 dark:border-gray-800 rounded-xl">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center">
                    <ShieldAlert className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalYellowCards}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Tarjetas Amarillas
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-gray-900/80 border border-gray-100 dark:border-gray-800 rounded-xl">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                    <ShieldAlert className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalRedCards}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Tarjetas Rojas
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Top Scorers */}
              <Card className="relative bg-white dark:bg-gray-900/80 shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden rounded-2xl backdrop-blur-sm">
                {/* Gradient accent bar */}
                <div className="h-1.5 bg-gradient-to-r from-brand via-brand-mid to-brand-2" />
                <CardHeader className="border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-brand to-brand-mid rounded-xl shadow-lg shadow-brand/25">
                      <Target className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-gray-900 dark:text-white text-xl">
                      Máximos Goleadores
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {stats.topScorers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Sin goleadores registrados</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {stats.topScorers.map((scorer) => (
                        <div
                          key={scorer.playerId}
                          className="group flex items-center justify-between p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border border-gray-100 dark:border-gray-700 hover:border-brand/50 hover:shadow-lg hover:shadow-brand/10 transition-all duration-300"
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-lg transition-transform group-hover:scale-110 ${
                                scorer.position === 1
                                  ? "bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-yellow-500/30"
                                  : scorer.position === 2
                                    ? "bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800 shadow-gray-400/30"
                                    : scorer.position === 3
                                      ? "bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow-amber-600/30"
                                      : "bg-gradient-to-br from-brand to-brand-mid text-white shadow-brand/30"
                              }`}
                            >
                              {scorer.position}
                            </div>
                            <div className="flex items-center gap-3">
                              {scorer.teamLogoUrl && (
                                <img
                                  src={scorer.teamLogoUrl}
                                  alt={scorer.teamName}
                                  className="w-8 h-8 rounded-lg object-contain bg-white dark:bg-gray-800 p-0.5"
                                />
                              )}
                              <div>
                                <div className="font-semibold text-gray-900 dark:text-white group-hover:text-brand transition-colors">
                                  {scorer.playerName}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {scorer.teamName}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Medal className="w-5 h-5 text-brand" />
                            <span className="font-bold text-2xl bg-gradient-to-r from-brand to-brand-mid bg-clip-text text-transparent">
                              {scorer.goals}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Least Goals Conceded (Vallas Menos Vencidas) */}
              <Card className="relative bg-white dark:bg-gray-900/80 shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden rounded-2xl backdrop-blur-sm">
                {/* Gradient accent bar */}
                <div className="h-1.5 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500" />
                <CardHeader className="border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg shadow-green-500/25">
                      <Shield className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-gray-900 dark:text-white text-xl">
                      Vallas Menos Vencidas
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {stats.leastConceded.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Shield className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Sin datos disponibles</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {stats.leastConceded.map((team) => (
                        <div
                          key={team.teamId}
                          className="group flex items-center justify-between p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border border-gray-100 dark:border-gray-700 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300"
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-lg transition-transform group-hover:scale-110 ${
                                team.position === 1
                                  ? "bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-yellow-500/30"
                                  : team.position === 2
                                    ? "bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800 shadow-gray-400/30"
                                    : team.position === 3
                                      ? "bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow-amber-600/30"
                                      : "bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-green-500/30"
                              }`}
                            >
                              {team.position}
                            </div>
                            <div className="flex items-center gap-3">
                              {team.teamLogoUrl && (
                                <img
                                  src={team.teamLogoUrl}
                                  alt={team.teamName}
                                  className="w-10 h-10 rounded-lg object-contain bg-white dark:bg-gray-800 p-0.5"
                                />
                              )}
                              <div>
                                <div className="font-semibold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                                  {team.teamName}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {team.matchesPlayed} partidos jugados
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-green-500" />
                            <span className="font-bold text-2xl bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                              {team.goalsAgainst}
                            </span>
                            <span className="text-xs text-gray-400">GC</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Most Carded Players */}
              <Card className="relative bg-white dark:bg-gray-900/80 shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden rounded-2xl backdrop-blur-sm md:col-span-2">
                {/* Gradient accent bar */}
                <div className="h-1.5 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500" />
                <CardHeader className="border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl shadow-lg shadow-yellow-500/25">
                      <ShieldAlert className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-gray-900 dark:text-white text-xl">
                      Jugadores con más Tarjetas
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {stats.mostCarded.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <ShieldAlert className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Sin tarjetas registradas</p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-3">
                      {stats.mostCarded.map((player) => (
                        <div
                          key={player.playerId}
                          className="group flex items-center justify-between p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border border-gray-100 dark:border-gray-700 hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300"
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-lg transition-transform group-hover:scale-110 ${
                                player.position === 1
                                  ? "bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-yellow-500/30"
                                  : player.position === 2
                                    ? "bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800 shadow-gray-400/30"
                                    : player.position === 3
                                      ? "bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow-amber-600/30"
                                      : "bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-orange-500/30"
                              }`}
                            >
                              {player.position}
                            </div>
                            <div className="flex items-center gap-3">
                              {player.teamLogoUrl && (
                                <img
                                  src={player.teamLogoUrl}
                                  alt={player.teamName}
                                  className="w-8 h-8 rounded-lg object-contain bg-white dark:bg-gray-800 p-0.5"
                                />
                              )}
                              <div>
                                <div className="font-semibold text-gray-900 dark:text-white group-hover:text-orange-500 transition-colors">
                                  {player.playerName}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {player.teamName}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <div className="w-4 h-6 rounded-sm bg-yellow-400 border border-black/10 shadow-sm" />
                              <span className="font-bold text-lg text-yellow-600">
                                {player.yellowCards}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-4 h-6 rounded-sm bg-red-500 border border-black/10 shadow-sm" />
                              <span className="font-bold text-lg text-red-600">
                                {player.redCards}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Sancionados (N8) */}
              <Card className="relative bg-white dark:bg-gray-900/80 shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden rounded-2xl backdrop-blur-sm md:col-span-2">
                <div className="h-1.5 bg-gradient-to-r from-red-500 via-brand to-brand-2" />
                <CardHeader className="border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-red-500 to-brand rounded-xl shadow-lg shadow-red-500/25">
                      <ShieldAlert className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-gray-900 dark:text-white text-xl">
                      Sancionados
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <SuspensionsList
                    suspensions={suspensions}
                    emptyLabel="No hay jugadores sancionados actualmente"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Estadísticas avanzadas (S7): fair play, racha y cara a cara */}
            <AdvancedStats
              fairPlay={advancedStats.fairPlay}
              form={advancedStats.form}
            />
            <HeadToHead tournamentId={tournamentData.id} teams={advancedStats.teams} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
