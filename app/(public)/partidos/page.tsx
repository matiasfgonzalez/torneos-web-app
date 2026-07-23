"use client";

import { useState, useMemo, useEffect, useCallback, useTransition } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Filter,
  CalendarIcon,
  MapPin,
  Clock,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  AlertCircle,
  Shield,
  Zap,
  X,
} from "lucide-react";
import { PageHero, HeroHighlight } from "@/components/shared/PageHero";
import { FilterSelect, FilterGrid } from "@/components/shared/FilterSelect";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { IPartidos, MatchStatus } from "@modules/partidos/types";
import { tournamentPublicPath } from "@modules/torneos/utils/publicPath";
import { LiveNowSection } from "@modules/partidos/components/LiveNowSection";
import { formatDate } from "@/lib/formatDate";

const ITEMS_PER_PAGE = 12;

const DEFAULTS = { q: "", estado: "all", torneo: "all" };

interface MatchesResponse {
  data: IPartidos[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface MatchesSummary {
  total: number;
  today: number;
  byStatus: Record<string, number>;
  tournaments: { id: string; name: string }[];
}

export default function PartidosPage() {
  // Filtros en la URL (F2)
  const { values, setFilter, clearFilters, hasActiveFilters } =
    useUrlFilters(DEFAULTS);
  const filters = useMemo(
    () => ({
      search: values.q,
      status: values.estado,
      tournamentId: values.torneo,
    }),
    [values.q, values.estado, values.torneo],
  );

  const [list, setList] = useState<MatchesResponse | null>(null);
  const [summary, setSummary] = useState<MatchesSummary | null>(null);
  const [isPending, startFetch] = useTransition();
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState(values.q);

  // Debounce del buscador: la búsqueda va al server, no filtra en memoria.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(filters.search), 350);
    return () => clearTimeout(t);
  }, [filters.search]);

  // Cambiar un filtro vuelve a la página 1 (ajuste durante el render, no un
  // useEffect con setState en cascada).
  const filterKey = `${debouncedSearch}|${filters.status}|${filters.tournamentId}`;
  const [lastFilterKey, setLastFilterKey] = useState(filterKey);
  if (filterKey !== lastFilterKey) {
    setLastFilterKey(filterKey);
    setCurrentPage(1);
  }

  // El fetch va dentro de una transición: así el setState no queda en el cuerpo
  // del effect (react-hooks/set-state-in-effect).
  const fetchList = useCallback(() => {
    startFetch(async () => {
      try {
        const qs = new URLSearchParams({
          page: String(currentPage),
          limit: String(ITEMS_PER_PAGE),
        });
        if (debouncedSearch) qs.set("q", debouncedSearch);
        if (filters.status !== "all") qs.set("status", filters.status);
        if (filters.tournamentId !== "all")
          qs.set("tournamentId", filters.tournamentId);
        const res = await fetch(`/api/matches?${qs.toString()}`);
        setList(await res.json());
      } catch (error) {
        console.error("Error fetching matches:", error);
      }
    });
  }, [currentPage, debouncedSearch, filters.status, filters.tournamentId]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const isLoading = list === null || isPending;

  // El resumen (cifras del hero + torneos del filtro) mira TODO el conjunto,
  // así que va una sola vez y no depende de la página ni de los filtros.
  useEffect(() => {
    fetch("/api/matches/summary")
      .then((r) => r.json())
      .then(setSummary)
      .catch((e) => console.error("Error fetching summary:", e));
  }, []);

  const tournaments = summary?.tournaments ?? [];
  const matches = list?.data ?? [];
  const totalPages = list?.totalPages ?? 1;
  const total = list?.total ?? 0;

  const stats = useMemo(() => {
    const bs = summary?.byStatus ?? {};
    const live = (bs.EN_JUEGO ?? 0) + (bs.ENTRETIEMPO ?? 0);
    return {
      total: summary?.total ?? 0,
      live,
      today: summary?.today ?? 0,
      upcoming: bs.PROGRAMADO ?? 0,
    };
  }, [summary]);

  const getStatusIcon = (status: MatchStatus) => {
    switch (status) {
      case MatchStatus.EN_JUEGO:
        return <Play className="h-3.5 w-3.5" />;
      case MatchStatus.FINALIZADO:
        return <CheckCircle className="h-3.5 w-3.5" />;
      case MatchStatus.PROGRAMADO:
        return <Clock className="h-3.5 w-3.5" />;
      case MatchStatus.SUSPENDIDO:
        return <Pause className="h-3.5 w-3.5" />;
      case MatchStatus.CANCELADO:
      case MatchStatus.POSTERGADO:
        return <XCircle className="h-3.5 w-3.5" />;
      default:
        return <AlertCircle className="h-3.5 w-3.5" />;
    }
  };

  const getStatusColor = (status: MatchStatus) => {
    switch (status) {
      case MatchStatus.EN_JUEGO:
        return "bg-red-500 text-white animate-pulse";
      case MatchStatus.FINALIZADO:
        return "bg-gray-500 text-white";
      case MatchStatus.PROGRAMADO:
        return "bg-blue-500 text-white";
      case MatchStatus.SUSPENDIDO:
      case MatchStatus.CANCELADO:
        return "bg-red-600/80 text-white";
      case MatchStatus.POSTERGADO:
        return "bg-amber-500 text-white";
      case MatchStatus.WALKOVER:
        return "bg-purple-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const activeFiltersCount = [
    filters.status !== "all",
    filters.tournamentId !== "all",
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen premium-gradient-bg">
      {/* Hero - componente compartido F0 (patrón §1 de UI_PATTERNS) */}
      <PageHero
        badge={{ icon: Zap, text: "En Vivo y Programados" }}
        title={
          <>
            Todos los <HeroHighlight>Partidos</HeroHighlight>
          </>
        }
        subtitle="Seguí los encuentros de todos los torneos en un solo lugar."
        stats={[
          {
            icon: Trophy,
            value: summary === null ? "..." : stats.total,
            label: "Total",
          },
          {
            icon: Play,
            value: summary === null ? "..." : stats.live,
            label: "En Vivo",
            gradient: "from-red-500 to-rose-500",
            shadow: "shadow-red-500/20",
          },
          {
            icon: CalendarIcon,
            value: summary === null ? "..." : stats.today,
            label: "Hoy",
            gradient: "from-green-500 to-emerald-500",
            shadow: "shadow-green-500/20",
          },
          {
            icon: Clock,
            value: summary === null ? "..." : stats.upcoming,
            label: "Próximos",
            gradient: "from-amber-500 to-orange-500",
            shadow: "shadow-amber-500/20",
          },
        ]}
      />

      <section className="pb-16 lg:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* En vivo ahora (S6): se puebla y actualiza solo por polling */}
          <LiveNowSection />

          {/* Búsqueda y filtros (chips + estado en URL, F2) */}
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl mb-8">
            <CardContent className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar equipos, torneos, estadios..."
                    className="pl-10 h-11 rounded-xl border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-brand/30 focus:border-brand"
                    value={filters.search}
                    onChange={(e) => setFilter("q", e.target.value)}
                  />
                </div>

                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="h-11 rounded-xl border-gray-200 dark:border-gray-600 shrink-0"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Limpiar
                    {activeFiltersCount > 0 && (
                      <Badge className="ml-2 bg-gradient-to-r from-brand to-brand-2 text-white border-0">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                )}
              </div>

              <FilterGrid>
                <FilterSelect
                  label="Estado"
                  icon={Filter}
                  value={filters.status}
                  onChange={(v) => setFilter("estado", v)}
                  options={[
                    { value: "all", label: "Todos" },
                    { value: MatchStatus.PROGRAMADO, label: "Programado" },
                    { value: MatchStatus.EN_JUEGO, label: "En juego" },
                    { value: MatchStatus.FINALIZADO, label: "Finalizado" },
                    { value: MatchStatus.SUSPENDIDO, label: "Suspendido" },
                    { value: MatchStatus.POSTERGADO, label: "Postergado" },
                  ]}
                />

                <FilterSelect
                  label="Torneo"
                  icon={Trophy}
                  value={filters.tournamentId}
                  onChange={(v) => setFilter("torneo", v)}
                  options={[
                    { value: "all", label: "Todos" },
                    ...tournaments.map((t) => ({ value: t.id, label: t.name })),
                  ]}
                />
              </FilterGrid>
            </CardContent>
          </Card>

          {/* Matches Grid */}
          {isLoading ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 border-4 border-brand/30 border-t-brand rounded-full animate-spin mx-auto" />
              <p className="mt-4 text-gray-500 dark:text-gray-400">
                Cargando partidos...
              </p>
            </div>
          ) : matches.length === 0 ? (
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl">
              <CardContent className="p-12 text-center">
                <Trophy className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  No se encontraron partidos
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Intenta ajustar los filtros o buscar con otros términos
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {matches.map((match) => (
                <Card
                  key={match.id}
                  className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand to-brand-2 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <Badge
                        className={`${getStatusColor(match.status)} gap-1`}
                      >
                        {getStatusIcon(match.status)}
                        {match.status.replace("_", " ")}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="border-brand/30 text-brand"
                      >
                        {match.tournament.name}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-brand/20 flex items-center justify-center bg-gray-50 dark:bg-gray-700 shrink-0">
                          {match.homeTeam.team.logoUrl ? (
                            <img
                              src={match.homeTeam.team.logoUrl}
                              alt={match.homeTeam.team.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Shield className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white truncate hidden md:block">
                            {match.homeTeam.team.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {match.homeTeam.team.shortName ||
                              match.homeTeam.team.name}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 px-2 shrink-0">
                        {match.status === MatchStatus.FINALIZADO ||
                        match.status === MatchStatus.EN_JUEGO ||
                        match.status === MatchStatus.ENTRETIEMPO ? (
                          <div className="text-center">
                            <div className="text-3xl font-bold font-mono text-gray-800 dark:text-gray-100">
                              {match.homeScore ?? 0} - {match.awayScore ?? 0}
                            </div>
                            {(match.status === MatchStatus.EN_JUEGO ||
                              match.status === MatchStatus.ENTRETIEMPO) && (
                              <div className="text-xs text-red-600 dark:text-red-400 font-medium animate-pulse">
                                {match.status === MatchStatus.ENTRETIEMPO
                                  ? "ENTRETIEMPO"
                                  : "EN VIVO"}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center">
                            <div className="text-sm font-semibold text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                              VS
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3 flex-1 justify-end min-w-0">
                        <div className="text-right min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white truncate hidden md:block">
                            {match.awayTeam.team.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {match.awayTeam.team.shortName ||
                              match.awayTeam.team.name}
                          </p>
                        </div>
                        <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-brand/20 flex items-center justify-center bg-gray-50 dark:bg-gray-700 shrink-0">
                          {match.awayTeam.team.logoUrl ? (
                            <img
                              src={match.awayTeam.team.logoUrl}
                              alt={match.awayTeam.team.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Shield className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    <Separator className="dark:bg-gray-700" />

                    <div className="grid grid-cols-2 gap-3 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-brand" />
                        <span>{formatDate(match.dateTime, "dd MMM yyyy")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-brand" />
                        <span>{formatDate(match.dateTime, "HH:mm")}</span>
                      </div>
                      {match.stadium && (
                        <div className="flex items-center gap-2 col-span-2 truncate">
                          <MapPin className="h-4 w-4 text-brand-2 shrink-0" />
                          <span className="truncate">
                            {match.stadium}
                            {match.city ? ` · ${match.city}` : ""}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-1">
                      <Link
                        href={`/partidos/${match.id}`}
                        className="flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-mid transition-colors"
                      >
                        Ver partido
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                      <Link
                        href={tournamentPublicPath(match.tournament)}
                        className="text-sm font-medium text-gray-500 hover:text-brand dark:text-gray-400 transition-colors"
                      >
                        Ver torneo
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
                    {Math.min(currentPage * ITEMS_PER_PAGE, total)} de {total}{" "}
                    partidos
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                      className="rounded-xl"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          let page = i + 1;
                          if (totalPages > 5) {
                            if (currentPage > 3) page = currentPage - 2 + i;
                            if (currentPage > totalPages - 2)
                              page = totalPages - 4 + i;
                          }
                          return (
                            <Button
                              key={page}
                              variant={
                                currentPage === page ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => setCurrentPage(page)}
                              disabled={currentPage === page}
                              className={
                                currentPage === page
                                  ? "rounded-xl bg-gradient-to-r from-brand to-brand-2 text-white border-0"
                                  : "rounded-xl"
                              }
                            >
                              {page}
                            </Button>
                          );
                        },
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="rounded-xl"
                    >
                      Siguiente
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
