"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Users,
  Eye,
  ChevronRight,
  Grid3X3,
  LayoutList,
  Filter,
  X,
  Zap,
  Award,
  TrendingUp,
  MapPin,
  SortAsc,
  UserCheck,
  Activity,
  Target,
} from "lucide-react";
import Link from "next/link";
import { IPlayer } from "@modules/jugadores/types";
import {
  PLAYER_STATUS_LABELS,
  PLAYER_STATUS_OPTIONS,
  PLAYER_STATUS_COLORS,
  PLAYER_POSITION_LABELS,
  PLAYER_POSITION_OPTIONS,
  FOOT_LABELS,
  FOOT_COLORS,
} from "@/lib/constants";
import { PlayerStatus, PlayerPosition, Foot } from "@prisma/client";

type SortOption = "name-asc" | "name-desc" | "number-asc" | "number-desc";
type ViewMode = "grid" | "list";

const PlayersListInterface = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPosition, setFilterPosition] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortOption>("name-asc");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [players, setPlayers] = useState<IPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/players");
        const data = await response.json();
        setPlayers(data);
      } catch (error) {
        console.error("Error fetching players:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlayers();
  }, []);

  // Estadísticas
  const stats = useMemo(() => {
    const activos = players.filter((p) => p.status === "ACTIVO").length;
    const posiciones = new Set(players.map((p) => p.position).filter(Boolean))
      .size;
    const nacionalidades = new Set(
      players.map((p) => p.nationality).filter(Boolean),
    ).size;
    return { total: players.length, activos, posiciones, nacionalidades };
  }, [players]);

  // Posiciones más populares
  const posicionesPopulares = useMemo(() => {
    const counts = players.reduce(
      (acc, p) => {
        if (p.position) {
          acc[p.position] = (acc[p.position] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>,
    );
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [players]);

  // Filtrar y ordenar jugadores
  const filteredPlayers = useMemo(() => {
    let result = players.filter((player) => {
      const matchesSearch =
        player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.nationality?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.birthPlace?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPosition =
        filterPosition === "" || player.position === filterPosition;
      const matchesStatus =
        filterStatus === "" || player.status === filterStatus;

      return matchesSearch && matchesPosition && matchesStatus;
    });

    // Ordenar
    result.sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "number-asc":
          return (a.number || 0) - (b.number || 0);
        case "number-desc":
          return (b.number || 0) - (a.number || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [players, searchTerm, filterPosition, filterStatus, sortBy]);

  const activeFiltersCount = [filterPosition, filterStatus].filter(
    Boolean,
  ).length;

  const clearFilters = () => {
    setSearchTerm("");
    setFilterPosition("");
    setFilterStatus("");
    setSortBy("name-asc");
  };

  const getStatusColor = (status: string) => {
    return PLAYER_STATUS_COLORS[status as PlayerStatus] || "bg-gray-500";
  };

  const getStatusLabel = (status: string) => {
    return PLAYER_STATUS_LABELS[status as PlayerStatus] || status;
  };

  const getPositionLabel = (position: string | null) => {
    if (!position) return "Sin posición";
    return PLAYER_POSITION_LABELS[position as PlayerPosition] || position;
  };

  const getFootLabel = (foot: string | null) => {
    if (!foot) return "N/A";
    return FOOT_LABELS[foot as Foot] || foot;
  };

  const getFootColor = (foot: string | null) => {
    if (!foot) return "text-gray-400";
    return FOOT_COLORS[foot as Foot] || "text-gray-400";
  };

  return (
    <div className="min-h-screen premium-gradient-bg">
      {/* Hero Section - Premium Golazo Style */}
      <section className="relative overflow-hidden py-20 lg:py-28">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-[#ad45ff]/20 to-[#a3b3ff]/20 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-[#a3b3ff]/15 to-[#ad45ff]/15 rounded-full blur-3xl transform -translate-x-1/4 translate-y-1/4" />
          <div className="absolute top-20 right-20 w-32 h-0.5 bg-gradient-to-r from-[#ad45ff] to-transparent opacity-40" />
          <div className="absolute top-28 right-28 w-20 h-0.5 bg-gradient-to-r from-[#a3b3ff] to-transparent opacity-30" />
          <div className="absolute bottom-32 left-16 w-40 h-0.5 bg-gradient-to-l from-[#ad45ff] to-transparent opacity-30" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] text-white px-5 py-2 rounded-full shadow-lg shadow-[#ad45ff]/25 animate-pulse">
              <Users className="w-5 h-5" />
              <span className="font-semibold">Plantel Oficial</span>
              <Zap className="w-4 h-4" />
            </div>

            <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 dark:text-white text-balance leading-tight">
              Nuestros{" "}
              <span className="relative">
                <span className="bg-gradient-to-r from-[#ad45ff] via-[#c77dff] to-[#a3b3ff] bg-clip-text text-transparent">
                  Jugadores
                </span>
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  height="8"
                  viewBox="0 0 200 8"
                  fill="none"
                >
                  <path
                    d="M1 5.5C47.6667 2.16667 141.4 -2.3 199 5.5"
                    stroke="url(#underline-gradient-jugadores)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient
                      id="underline-gradient-jugadores"
                      x1="0"
                      y1="0"
                      x2="200"
                      y2="0"
                    >
                      <stop stopColor="#ad45ff" />
                      <stop offset="1" stopColor="#a3b3ff" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </h1>

            <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-pretty leading-relaxed">
              Conoce a los talentos que forman parte de nuestros equipos.
              Explora sus perfiles, estadísticas y trayectoria deportiva.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <div className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-[#ad45ff]/5 to-[#a3b3ff]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-[#ad45ff] to-[#a3b3ff] rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-[#ad45ff]/20">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                  {isLoading ? "..." : stats.total}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  Total Jugadores
                </div>
              </div>
            </div>

            <div className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-green-500/20">
                  <UserCheck className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                  {isLoading ? "..." : stats.activos}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  Activos
                </div>
              </div>
            </div>

            <div className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                  {isLoading ? "..." : stats.posiciones}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  Posiciones
                </div>
              </div>
            </div>

            <div className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-orange-500/20">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                  {isLoading ? "..." : stats.nacionalidades}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  Nacionalidades
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Positions Pills */}
      {posicionesPopulares.length > 0 && (
        <section className="py-8 border-y border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 mr-2">
                Posiciones destacadas:
              </span>
              {posicionesPopulares.map(([posicion, count]) => (
                <Badge
                  key={posicion}
                  variant="outline"
                  className="px-4 py-2 text-sm font-medium border-2 border-[#ad45ff]/30 text-[#ad45ff] hover:bg-[#ad45ff] hover:text-white transition-all cursor-pointer"
                  onClick={() => setFilterPosition(posicion)}
                >
                  <Activity className="w-3.5 h-3.5 mr-1.5" />
                  {getPositionLabel(posicion)} ({count})
                </Badge>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filter Panel */}
          <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/50 dark:border-gray-700/50 shadow-xl p-6 mb-8">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#ad45ff]/10 to-[#a3b3ff]/10 rounded-tr-2xl rounded-bl-full" />

            <div className="relative">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#ad45ff] to-[#a3b3ff] rounded-xl flex items-center justify-center shadow-lg shadow-[#ad45ff]/20">
                    <Filter className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      Buscar Jugadores
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {filteredPlayers.length} de {players.length} jugadores
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded-md transition-all ${viewMode === "grid" ? "bg-white dark:bg-gray-600 shadow-sm text-[#ad45ff]" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"}`}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded-md transition-all ${viewMode === "list" ? "bg-white dark:bg-gray-600 shadow-sm text-[#ad45ff]" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"}`}
                    >
                      <LayoutList className="w-4 h-4" />
                    </button>
                  </div>

                  {activeFiltersCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#ad45ff] bg-[#ad45ff]/10 rounded-lg hover:bg-[#ad45ff]/20 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      Limpiar ({activeFiltersCount})
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1">
                  <label
                    htmlFor="search-players"
                    className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2"
                  >
                    Buscar
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="search-players"
                      type="text"
                      placeholder="Nombre, nacionalidad..."
                      className="pl-10 h-11 rounded-xl border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-[#ad45ff]/30 focus:border-[#ad45ff] transition-all"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="filter-position"
                    className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2"
                  >
                    <Target className="w-3.5 h-3.5 inline mr-1" />
                    Posición
                  </label>
                  <select
                    id="filter-position"
                    value={filterPosition}
                    onChange={(e) => setFilterPosition(e.target.value)}
                    className="w-full h-11 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 text-sm focus:ring-2 focus:ring-[#ad45ff]/30 focus:border-[#ad45ff] transition-all"
                  >
                    <option value="">Todas las posiciones</option>
                    {PLAYER_POSITION_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="filter-status"
                    className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2"
                  >
                    <Activity className="w-3.5 h-3.5 inline mr-1" />
                    Estado
                  </label>
                  <select
                    id="filter-status"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full h-11 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 text-sm focus:ring-2 focus:ring-[#ad45ff]/30 focus:border-[#ad45ff] transition-all"
                  >
                    <option value="">Todos los estados</option>
                    {PLAYER_STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="sort-players"
                    className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2"
                  >
                    <SortAsc className="w-3.5 h-3.5 inline mr-1" />
                    Ordenar por
                  </label>
                  <select
                    id="sort-players"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="w-full h-11 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 text-sm focus:ring-2 focus:ring-[#ad45ff]/30 focus:border-[#ad45ff] transition-all"
                  >
                    <option value="name-asc">Nombre (A-Z)</option>
                    <option value="name-desc">Nombre (Z-A)</option>
                    <option value="number-asc">Número (↑)</option>
                    <option value="number-desc">Número (↓)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 border-4 border-[#ad45ff]/30 border-t-[#ad45ff] rounded-full animate-spin mx-auto" />
              <p className="mt-4 text-gray-500 dark:text-gray-400">
                Cargando jugadores...
              </p>
            </div>
          ) : filteredPlayers.length === 0 ? (
            <div className="text-center py-20">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-br from-[#ad45ff]/20 to-[#a3b3ff]/20 rounded-full blur-2xl" />
                <div className="relative w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <Users className="w-12 h-12 text-gray-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                No se encontraron jugadores
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                No hay jugadores que coincidan con tu búsqueda. Intenta con
                otros filtros.
              </p>
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] text-white font-semibold rounded-xl shadow-lg shadow-[#ad45ff]/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
              >
                <X className="w-4 h-4" />
                Limpiar Filtros
              </button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPlayers.map((player) => (
                <Link
                  key={player.id}
                  href={`/jugadores/${player.id}`}
                  className="group block h-full"
                >
                  <Card className="h-full border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 overflow-hidden relative group-hover:-translate-y-1">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                    <div className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#ad45ff]/30 group-hover:border-[#ad45ff] transition-colors">
                            {player.imageUrlFace ? (
                              <img
                                src={player.imageUrlFace}
                                alt={player.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-[#ad45ff]/20 to-[#a3b3ff]/20 flex items-center justify-center">
                                <span className="text-2xl font-bold text-[#ad45ff]">
                                  {player.name.charAt(0)}
                                </span>
                              </div>
                            )}
                          </div>
                          <div
                            className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(player.status)} rounded-full border-2 border-white dark:border-gray-800`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-[#ad45ff] transition-colors truncate">
                              {player.name}
                            </h3>
                            {player.number != null && (
                              <span className="text-xl font-bold text-[#ad45ff]">
                                #{player.number}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {getPositionLabel(player.position)}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mb-4 py-3 border-y border-gray-100 dark:border-gray-700/50">
                        <div className="text-center">
                          <div className="text-sm font-bold text-gray-900 dark:text-white">
                            {player.height ? `${player.height}cm` : "N/A"}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Altura
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-bold text-gray-900 dark:text-white">
                            {player.weight ? `${player.weight}kg` : "N/A"}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Peso
                          </div>
                        </div>
                        <div className="text-center">
                          <div
                            className={`text-sm font-bold ${getFootColor(player.dominantFoot)}`}
                          >
                            {getFootLabel(player.dominantFoot)}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Pie
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Badge
                          className={`${getStatusColor(player.status)} text-white text-xs`}
                        >
                          {getStatusLabel(player.status)}
                        </Badge>
                        <div className="flex items-center gap-1 text-[#ad45ff] group-hover:text-[#c77dff] transition-colors">
                          <Eye className="w-4 h-4" />
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPlayers.map((player) => (
                <Link
                  key={player.id}
                  href={`/jugadores/${player.id}`}
                  className="group block"
                >
                  <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#ad45ff]/30 group-hover:border-[#ad45ff] transition-colors">
                              {player.imageUrlFace ? (
                                <img
                                  src={player.imageUrlFace}
                                  alt={player.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-[#ad45ff]/20 to-[#a3b3ff]/20 flex items-center justify-center">
                                  <span className="text-xl font-bold text-[#ad45ff]">
                                    {player.name.charAt(0)}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div
                              className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(player.status)} rounded-full border border-white dark:border-gray-800`}
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-[#ad45ff] transition-colors">
                                {player.name}
                              </h3>
                              {player.number != null && (
                                <span className="text-xl font-bold text-[#ad45ff]">
                                  #{player.number}
                                </span>
                              )}
                              <Badge
                                variant="outline"
                                className="border-[#ad45ff]/30 text-[#ad45ff]"
                              >
                                {getPositionLabel(player.position)}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                              {player.nationality && (
                                <span>{player.nationality}</span>
                              )}
                              {player.birthPlace && (
                                <>
                                  <span>•</span>
                                  <span>{player.birthPlace}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-8">
                          <div className="hidden md:flex gap-6 text-sm">
                            <div className="text-center">
                              <div className="font-bold text-gray-900 dark:text-white">
                                {player.height ? `${player.height}cm` : "N/A"}
                              </div>
                              <div className="text-gray-500 dark:text-gray-400">
                                Altura
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-gray-900 dark:text-white">
                                {player.weight ? `${player.weight}kg` : "N/A"}
                              </div>
                              <div className="text-gray-500 dark:text-gray-400">
                                Peso
                              </div>
                            </div>
                            <div className="text-center">
                              <div
                                className={`font-bold ${getFootColor(player.dominantFoot)}`}
                              >
                                {getFootLabel(player.dominantFoot)}
                              </div>
                              <div className="text-gray-500 dark:text-gray-400">
                                Pie
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge
                              className={`${getStatusColor(player.status)} text-white`}
                            >
                              {getStatusLabel(player.status)}
                            </Badge>
                            <div className="flex items-center gap-1 text-[#ad45ff] group-hover:text-[#c77dff] transition-colors">
                              <Eye className="w-4 h-4" />
                              <ChevronRight className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] opacity-95" />
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute bottom-10 right-10 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl mb-6 shadow-xl">
            <Award className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            ¿Quieres unirte a un equipo?
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Regístrate como jugador y forma parte de los mejores equipos de la
            región.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 bg-white text-[#ad45ff] px-8 py-4 rounded-xl font-bold shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300"
            >
              <TrendingUp className="w-5 h-5" />
              Registrarme
            </Link>
            <Link
              href="/equipos"
              className="inline-flex items-center justify-center gap-2 bg-white/20 backdrop-blur-xl text-white px-8 py-4 rounded-xl font-bold border border-white/30 hover:bg-white/30 transition-all duration-300"
            >
              Ver Equipos Disponibles
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PlayersListInterface;
