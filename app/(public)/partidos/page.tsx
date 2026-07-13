"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { isToday } from "date-fns";
import { PageHero, HeroHighlight } from "@/components/shared/PageHero";
import { IPartidos, MatchStatus } from "@modules/partidos/types";
import { formatDate } from "@/lib/formatDate";

const ITEMS_PER_PAGE = 6;

interface Filters {
  status: string;
  tournamentId: string;
  search: string;
}

const EMPTY_FILTERS: Filters = { status: "all", tournamentId: "all", search: "" };

export default function PartidosPage() {
  const [matches, setMatches] = useState<IPartidos[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/matches");
        const data: IPartidos[] = await response.json();
        setMatches(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching matches:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMatches();
  }, []);

  // Torneos reales derivados de los partidos cargados (antes: lista mock hardcodeada)
  const tournaments = useMemo(() => {
    const map = new Map<string, string>();
    matches.forEach((m) => map.set(m.tournamentId, m.tournament.name));
    return Array.from(map, ([id, name]) => ({ id, name })).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [matches]);

  const filteredMatches = useMemo(() => {
    const term = filters.search.toLowerCase();
    return matches.filter((match) => {
      const matchesSearch =
        !term ||
        match.homeTeam.team.name.toLowerCase().includes(term) ||
        match.awayTeam.team.name.toLowerCase().includes(term) ||
        match.tournament.name.toLowerCase().includes(term) ||
        match.stadium?.toLowerCase().includes(term);
      const matchesStatus =
        filters.status === "all" || match.status === filters.status;
      const matchesTournament =
        filters.tournamentId === "all" ||
        match.tournamentId === filters.tournamentId;
      return matchesSearch && matchesStatus && matchesTournament;
    });
  }, [matches, filters]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredMatches.length / ITEMS_PER_PAGE),
  );
  const paginatedMatches = filteredMatches.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const stats = useMemo(() => {
    const total = matches.length;
    const live = matches.filter((m) => m.status === MatchStatus.EN_JUEGO).length;
    const today = matches.filter((m) => isToday(new Date(m.dateTime))).length;
    const upcoming = matches.filter(
      (m) => m.status === MatchStatus.PROGRAMADO,
    ).length;
    return { total, live, today, upcoming };
  }, [matches]);

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

  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
    setCurrentPage(1);
  };

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const activeFiltersCount = [
    filters.status !== "all",
    filters.tournamentId !== "all",
  ].filter(Boolean).length;

  const clearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setCurrentPage(1);
  };

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
            value: isLoading ? "..." : stats.total,
            label: "Total",
          },
          {
            icon: Play,
            value: isLoading ? "..." : stats.live,
            label: "En Vivo",
            gradient: "from-red-500 to-rose-500",
            shadow: "shadow-red-500/20",
          },
          {
            icon: CalendarIcon,
            value: isLoading ? "..." : stats.today,
            label: "Hoy",
            gradient: "from-green-500 to-emerald-500",
            shadow: "shadow-green-500/20",
          },
          {
            icon: Clock,
            value: isLoading ? "..." : stats.upcoming,
            label: "Próximos",
            gradient: "from-amber-500 to-orange-500",
            shadow: "shadow-amber-500/20",
          },
        ]}
      />

      <section className="pb-16 lg:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search and Filters */}
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar equipos, torneos, estadios..."
                    className="pl-10 h-11 rounded-xl border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-[#ad45ff]/30 focus:border-[#ad45ff]"
                    value={filters.search}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>

                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="h-11 rounded-xl border-gray-200 dark:border-gray-600"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                  {activeFiltersCount > 0 && (
                    <Badge className="ml-2 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] text-white border-0">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </div>

              {showFilters && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">
                        Estado
                      </label>
                      <Select
                        value={filters.status}
                        onValueChange={(value) => handleFilterChange("status", value)}
                      >
                        <SelectTrigger className="h-11 rounded-xl bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                          <SelectValue placeholder="Todos los estados" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los estados</SelectItem>
                          <SelectItem value={MatchStatus.PROGRAMADO}>Programado</SelectItem>
                          <SelectItem value={MatchStatus.EN_JUEGO}>En juego</SelectItem>
                          <SelectItem value={MatchStatus.FINALIZADO}>Finalizado</SelectItem>
                          <SelectItem value={MatchStatus.SUSPENDIDO}>Suspendido</SelectItem>
                          <SelectItem value={MatchStatus.POSTERGADO}>Postergado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">
                        Torneo
                      </label>
                      <Select
                        value={filters.tournamentId}
                        onValueChange={(value) => handleFilterChange("tournamentId", value)}
                      >
                        <SelectTrigger className="h-11 rounded-xl bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                          <SelectValue placeholder="Todos los torneos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los torneos</SelectItem>
                          {tournaments.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-end">
                      <Button
                        variant="outline"
                        onClick={clearFilters}
                        disabled={activeFiltersCount === 0 && !filters.search}
                        className="w-full h-11 rounded-xl border-gray-200 dark:border-gray-600"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Limpiar Filtros
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Matches Grid */}
          {isLoading ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 border-4 border-[#ad45ff]/30 border-t-[#ad45ff] rounded-full animate-spin mx-auto" />
              <p className="mt-4 text-gray-500 dark:text-gray-400">
                Cargando partidos...
              </p>
            </div>
          ) : paginatedMatches.length === 0 ? (
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
              {paginatedMatches.map((match) => (
                <Card
                  key={match.id}
                  className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <Badge className={`${getStatusColor(match.status)} gap-1`}>
                        {getStatusIcon(match.status)}
                        {match.status.replace("_", " ")}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="border-[#ad45ff]/30 text-[#ad45ff]"
                      >
                        {match.tournament.name}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-[#ad45ff]/20 flex items-center justify-center bg-gray-50 dark:bg-gray-700 shrink-0">
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
                            {match.homeTeam.team.shortName || match.homeTeam.team.name}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 px-2 shrink-0">
                        {match.status === MatchStatus.FINALIZADO ||
                        match.status === MatchStatus.EN_JUEGO ? (
                          <div className="text-center">
                            <div className="text-3xl font-bold font-mono text-gray-800 dark:text-gray-100">
                              {match.homeScore ?? 0} - {match.awayScore ?? 0}
                            </div>
                            {match.status === MatchStatus.EN_JUEGO && (
                              <div className="text-xs text-red-600 dark:text-red-400 font-medium animate-pulse">
                                EN VIVO
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
                            {match.awayTeam.team.shortName || match.awayTeam.team.name}
                          </p>
                        </div>
                        <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-[#ad45ff]/20 flex items-center justify-center bg-gray-50 dark:bg-gray-700 shrink-0">
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
                        <CalendarIcon className="h-4 w-4 text-[#ad45ff]" />
                        <span>{formatDate(match.dateTime, "dd MMM yyyy")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-[#ad45ff]" />
                        <span>{formatDate(match.dateTime, "HH:mm")}</span>
                      </div>
                      {match.stadium && (
                        <div className="flex items-center gap-2 col-span-2 truncate">
                          <MapPin className="h-4 w-4 text-[#a3b3ff] shrink-0" />
                          <span className="truncate">
                            {match.stadium}
                            {match.city ? ` · ${match.city}` : ""}
                          </span>
                        </div>
                      )}
                    </div>

                    <Link
                      href={`/torneos/${match.tournamentId}`}
                      className="flex items-center justify-center gap-1.5 text-sm font-medium text-[#ad45ff] hover:text-[#c77dff] transition-colors pt-1"
                    >
                      Ver torneo
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
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
                    {Math.min(currentPage * ITEMS_PER_PAGE, filteredMatches.length)}{" "}
                    de {filteredMatches.length} partidos
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="rounded-xl"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let page = i + 1;
                        if (totalPages > 5) {
                          if (currentPage > 3) page = currentPage - 2 + i;
                          if (currentPage > totalPages - 2) page = totalPages - 4 + i;
                        }
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            disabled={currentPage === page}
                            className={
                              currentPage === page
                                ? "rounded-xl bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] text-white border-0"
                                : "rounded-xl"
                            }
                          >
                            {page}
                          </Button>
                        );
                      })}
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
