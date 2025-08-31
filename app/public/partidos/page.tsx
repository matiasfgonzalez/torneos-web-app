"use client";

import { useState, useMemo, useEffect } from "react";
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
  Users,
  Clock,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Share2,
  Bookmark,
  TrendingUp,
} from "lucide-react";
import { format, isToday, isTomorrow, isYesterday } from "date-fns";
import { es } from "date-fns/locale";
import { MatchType, type MatchFilters } from "@/types/match";
import { IPartidos, MatchStatus } from "@/components/partidos/types";
import { formatDate } from "@/lib/formatDate";

const mockTournaments = [
  { id: "1", name: "La Liga" },
  { id: "2", name: "Copa del Rey" },
  { id: "3", name: "Champions League" },
  { id: "4", name: "Europa League" },
];

const ITEMS_PER_PAGE = 6;

export default function PartidosPage() {
  const [matches, setMatches] = useState<IPartidos[] | []>([]);
  const [filters, setFilters] = useState<MatchFilters>({
    status: "",
    type: "",
    tournamentId: "",
    search: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // LLamar a la API matches
    const fetchMatches = async () => {
      try {
        const response = await fetch(`/api/matches`);
        const data: IPartidos[] = await response.json();
        setMatches(data);
        console.log(matches);
      } catch (error) {
        console.error("Error fetching matches:", error);
      }
    };
    fetchMatches();
  }, []);

  // Filtrar partidos
  const filteredMatches = useMemo(() => {
    return matches.filter((match) => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          match.homeTeam.team.name.toLowerCase().includes(searchLower) ||
          match.awayTeam.team.name.toLowerCase().includes(searchLower) ||
          match.tournament.name.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  }, [matches, filters]);

  // Paginación
  const totalPages = Math.ceil(filteredMatches.length / ITEMS_PER_PAGE);
  const paginatedMatches = filteredMatches.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Estadísticas
  const stats = useMemo(() => {
    const total = filteredMatches.length;
    const live = filteredMatches.filter(
      (m) => m.status === MatchStatus.EN_JUEGO
    ).length;
    const today = filteredMatches.filter((m) => isToday(m.dateTime)).length;
    const upcoming = filteredMatches.filter(
      (m) => m.status === MatchStatus.PROGRAMADO
    ).length;

    return { total, live, today, upcoming };
  }, [filteredMatches]);

  const getStatusIcon = (status: MatchStatus) => {
    switch (status) {
      case MatchStatus.EN_JUEGO:
        return <Play className="h-4 w-4" />;
      case MatchStatus.FINALIZADO:
        return <CheckCircle className="h-4 w-4" />;
      case MatchStatus.PROGRAMADO:
        return <Clock className="h-4 w-4" />;
      case MatchStatus.SUSPENDIDO:
        return <Pause className="h-4 w-4" />;
      case MatchStatus.POSTERGADO:
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: MatchStatus) => {
    switch (status) {
      case MatchStatus.EN_JUEGO:
        return "bg-red-500 text-white animate-pulse";
      case MatchStatus.FINALIZADO:
        return "bg-green-500 text-white";
      case MatchStatus.PROGRAMADO:
        return "bg-blue-500 text-white";
      case MatchStatus.SUSPENDIDO:
        return "bg-yellow-500 text-white";
      case MatchStatus.POSTERGADO:
        return "bg-gray-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return "Hoy";
    if (isTomorrow(date)) return "Mañana";
    if (isYesterday(date)) return "Ayer";
    return format(date, "dd MMM", { locale: es });
  };

  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
    setCurrentPage(1);
  };

  const handleFilterChange = (key: keyof MatchFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({ status: "", type: "", tournamentId: "", search: "" });
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-golazo-green rounded-xl">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-golazo-black dark:text-white">
                Partidos
              </h1>
              <p className="text-golazo-gray dark:text-slate-400">
                Sigue todos los encuentros en tiempo real
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Trophy className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">
                      {stats.total}
                    </p>
                    <p className="text-sm text-slate-600">Total</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Play className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-600">
                      {stats.live}
                    </p>
                    <p className="text-sm text-slate-600">En Vivo</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CalendarIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {stats.today}
                    </p>
                    <p className="text-sm text-slate-600">Hoy</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-600">
                      {stats.upcoming}
                    </p>
                    <p className="text-sm text-slate-600">Próximos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card className="backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Buscar equipos, torneos, estadios..."
                      className="pl-10 bg-white border-slate-200"
                      value={filters.search || ""}
                      onChange={(e) => handleSearch(e.target.value)}
                    />
                  </div>
                </div>

                {/* Filter Toggle */}
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="bg-white border-slate-200 hover:bg-slate-50"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                  {Object.keys(filters).filter(
                    (key) => filters[key as keyof MatchFilters]
                  ).length > 0 && (
                    <Badge className="ml-2 bg-golazo-green text-white">
                      {
                        Object.keys(filters).filter(
                          (key) => filters[key as keyof MatchFilters]
                        ).length
                      }
                    </Badge>
                  )}
                </Button>
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Status Filter */}
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">
                        Estado
                      </label>
                      <Select
                        value={filters.status}
                        onValueChange={(value) =>
                          handleFilterChange("status", value)
                        }
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Todos los estados" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los estados</SelectItem>
                          <SelectItem value={MatchStatus.PROGRAMADO}>
                            Programado
                          </SelectItem>
                          <SelectItem value={MatchStatus.EN_JUEGO}>
                            EN_JUEGO
                          </SelectItem>
                          <SelectItem value={MatchStatus.FINALIZADO}>
                            Finalizado
                          </SelectItem>
                          <SelectItem value={MatchStatus.SUSPENDIDO}>
                            Suspendido
                          </SelectItem>
                          <SelectItem value={MatchStatus.POSTERGADO}>
                            POSTERGADO
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Type Filter */}
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">
                        Tipo
                      </label>
                      <Select
                        value={filters.type}
                        onValueChange={(value) =>
                          handleFilterChange("type", value)
                        }
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Todos los tipos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los tipos</SelectItem>
                          <SelectItem value={MatchType.LIGA}>Liga</SelectItem>
                          <SelectItem value={MatchType.COPA}>Copa</SelectItem>
                          <SelectItem value={MatchType.PLAYOFF}>
                            Playoff
                          </SelectItem>
                          <SelectItem value={MatchType.AMISTOSO}>
                            Amistoso
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Tournament Filter */}
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">
                        Torneo
                      </label>
                      <Select
                        value={filters.tournamentId}
                        onValueChange={(value) =>
                          handleFilterChange("tournamentId", value)
                        }
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Todos los torneos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los torneos</SelectItem>
                          {mockTournaments.map((tournament) => (
                            <SelectItem
                              key={tournament.id}
                              value={tournament.id}
                            >
                              {tournament.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Clear Filters */}
                    <div className="flex items-end">
                      <Button
                        variant="outline"
                        onClick={clearFilters}
                        className="w-full bg-white border-slate-200 hover:bg-slate-50"
                      >
                        Limpiar Filtros
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Matches Grid */}
        {paginatedMatches.length === 0 ? (
          <Card className="backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <Trophy className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 mb-2">
                No se encontraron partidos
              </h3>
              <p className="text-slate-500">
                Intenta ajustar los filtros o buscar con otros términos
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {paginatedMatches.map((match) => (
              <Card
                key={match.id}
                className="backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(match.status)}>
                        {getStatusIcon(match.status)}
                        <span className="ml-1">
                          {match.status.replace("_", " ")}
                        </span>
                      </Badge>
                      <Badge variant="outline" className="">
                        {match.tournament.format}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Bookmark className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Teams and Score */}
                  <div className="flex items-center justify-between">
                    {/* Home Team */}
                    <div className="flex items-center gap-3 flex-1">
                      <img
                        src={match.homeTeam.team.logoUrl || "/placeholder.svg"}
                        alt={match.homeTeam.team.name}
                        className="w-12 h-12 object-cover"
                      />
                      <div>
                        <p className="font-semibold text-white hidden md:block">
                          {match.homeTeam.team.name}
                        </p>
                        <p className="text-sm text-slate-500">
                          {match.homeTeam.team.shortName}
                        </p>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="flex items-center gap-4 px-4">
                      {match.status === MatchStatus.FINALIZADO ||
                      match.status === MatchStatus.EN_JUEGO ? (
                        <div className="text-center">
                          <div className="text-3xl font-bold text-slate-800">
                            {match.homeScore} - {match.awayScore}
                          </div>
                          {match.status === MatchStatus.EN_JUEGO && (
                            <div className="text-xs text-red-600 font-medium animate-pulse">
                              EN VIVO
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="text-lg font-semibold text-slate-600">
                            VS
                          </div>
                          <div className="text-sm text-slate-500">
                            {formatDate(match.dateTime)}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Away Team */}
                    <div className="flex items-center gap-3 flex-1 justify-end">
                      <div className="text-right">
                        <p className="font-semibold text-white hidden md:block">
                          {match.awayTeam.team.name}
                        </p>
                        <p className="text-sm text-slate-500">
                          {match.awayTeam.team.shortName}
                        </p>
                      </div>
                      <img
                        src={match.awayTeam.team.logoUrl || "/placeholder.svg"}
                        alt={match.awayTeam.team.name}
                        className="w-12 h-12 object-cover"
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Match Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Trophy className="h-4 w-4" />
                      <span>{match.tournament.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {match.stadium} - {match.city}
                      </span>
                    </div>
                    {match.roundNumber && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <TrendingUp className="h-4 w-4" />
                        <span>
                          {match.phase?.name || "Sin fase"}
                          {match.roundNumber && ` - ${match.roundNumber}`}
                        </span>
                      </div>
                    )}
                    {match.dateTime && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Users className="h-4 w-4" />
                        <span>{formatDate(match.dateTime)}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Card className="backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-600">
                  Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{" "}
                  {Math.min(
                    currentPage * ITEMS_PER_PAGE,
                    filteredMatches.length
                  )}{" "}
                  de {filteredMatches.length} partidos
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className="bg-white border-slate-200"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let page = i + 1;
                      if (totalPages > 5) {
                        if (currentPage > 3) {
                          page = currentPage - 2 + i;
                        }
                        if (currentPage > totalPages - 2) {
                          page = totalPages - 4 + i;
                        }
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
                              ? "bg-golazo-green text-white"
                              : "bg-white border-slate-200"
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
                    className="bg-white border-slate-200"
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
    </div>
  );
}
