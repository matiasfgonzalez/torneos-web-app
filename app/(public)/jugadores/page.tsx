"use client";

import { useEffect, useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Search,
  Users,
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
import { PageHero, HeroHighlight } from "@/components/shared/PageHero";
import { EmptyState } from "@/components/shared/EmptyState";
import { FilterSelect, FilterGrid } from "@/components/shared/FilterSelect";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { PlayerCard } from "@modules/jugadores/components/public/PlayerCard";
import { IPlayer } from "@modules/jugadores/types";
import {
  PLAYER_STATUS_OPTIONS,
  PLAYER_POSITION_LABELS,
  PLAYER_POSITION_OPTIONS,
} from "@/lib/constants";
import { PlayerPosition } from "@prisma/client";

type SortOption = "name-asc" | "name-desc" | "number-asc" | "number-desc";
type ViewMode = "grid" | "list";

const DEFAULTS = {
  q: "",
  posicion: "",
  estado: "",
  orden: "name-asc",
};

const PlayersListInterface = () => {
  // Filtros en la URL (F2)
  const { values, setFilter, clearFilters, hasActiveFilters } =
    useUrlFilters(DEFAULTS);
  const {
    q: searchTerm,
    posicion: filterPosition,
    estado: filterStatus,
  } = values;
  const sortBy = values.orden as SortOption;

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
    const result = players.filter((player) => {
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

  const getPositionLabel = (position: string | null) => {
    if (!position) return "Sin posición";
    return PLAYER_POSITION_LABELS[position as PlayerPosition] || position;
  };

  return (
    <div className="min-h-screen premium-gradient-bg">
      {/* Hero - componente compartido F0 (patrón §1 de UI_PATTERNS) */}
      <PageHero
        badge={{ icon: Users, text: "Plantel Oficial", endIcon: Zap }}
        title={
          <>
            Nuestros <HeroHighlight>Jugadores</HeroHighlight>
          </>
        }
        subtitle="Conoce a los talentos que forman parte de nuestros equipos. Explora sus perfiles, estadísticas y trayectoria deportiva."
        stats={[
          {
            icon: Users,
            value: isLoading ? "..." : stats.total,
            label: "Total Jugadores",
          },
          {
            icon: UserCheck,
            value: isLoading ? "..." : stats.activos,
            label: "Activos",
            gradient: "from-green-500 to-emerald-500",
            shadow: "shadow-green-500/20",
          },
          {
            icon: Target,
            value: isLoading ? "..." : stats.posiciones,
            label: "Posiciones",
            gradient: "from-blue-500 to-cyan-500",
            shadow: "shadow-blue-500/20",
          },
          {
            icon: MapPin,
            value: isLoading ? "..." : stats.nacionalidades,
            label: "Nacionalidades",
            gradient: "from-orange-500 to-amber-500",
            shadow: "shadow-orange-500/20",
          },
        ]}
      />

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
                  className="px-4 py-2 text-sm font-medium border-2 border-brand/30 text-brand hover:bg-brand hover:text-white transition-all cursor-pointer"
                  onClick={() => setFilter("posicion", posicion)}
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
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-brand/10 to-brand-2/10 rounded-tr-2xl rounded-bl-full" />

            <div className="relative">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-brand to-brand-2 rounded-xl flex items-center justify-center shadow-lg shadow-brand/20">
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
                      className={`p-2 rounded-md transition-all ${viewMode === "grid" ? "bg-white dark:bg-gray-600 shadow-sm text-brand" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"}`}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded-md transition-all ${viewMode === "list" ? "bg-white dark:bg-gray-600 shadow-sm text-brand" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"}`}
                    >
                      <LayoutList className="w-4 h-4" />
                    </button>
                  </div>

                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-brand bg-brand/10 rounded-lg hover:bg-brand/20 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      Limpiar ({activeFiltersCount})
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {/* Búsqueda */}
                <div>
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
                      className="pl-10 h-11 rounded-xl border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all"
                      value={searchTerm}
                      onChange={(e) => setFilter("q", e.target.value)}
                    />
                  </div>
                </div>

                {/* Filtros desplegables: el disparador muestra el valor
                    activo y las opciones se abren al pedirlas. */}
                <FilterGrid>
                  <FilterSelect
                    label="Posición"
                    icon={Target}
                    value={filterPosition}
                    onChange={(v) => setFilter("posicion", v)}
                    options={[
                      { value: "", label: "Todas" },
                      ...PLAYER_POSITION_OPTIONS.map((o) => ({
                        value: o.value,
                        label: o.label,
                      })),
                    ]}
                  />

                  <FilterSelect
                    label="Estado"
                    icon={Activity}
                    value={filterStatus}
                    onChange={(v) => setFilter("estado", v)}
                    options={[
                      { value: "", label: "Todos" },
                      ...PLAYER_STATUS_OPTIONS.map((o) => ({
                        value: o.value,
                        label: o.label,
                      })),
                    ]}
                  />

                  <FilterSelect
                    label="Ordenar por"
                    icon={SortAsc}
                    value={sortBy}
                    onChange={(v) => setFilter("orden", v)}
                    options={[
                      { value: "name-asc", label: "Nombre (A-Z)" },
                      { value: "name-desc", label: "Nombre (Z-A)" },
                      { value: "number-asc", label: "Número ↑" },
                      { value: "number-desc", label: "Número ↓" },
                    ]}
                  />
                </FilterGrid>
              </div>
            </div>
          </div>

          {/* Content — anatomía compartida vía PlayerCard (F2) */}
          {isLoading ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 border-4 border-brand/30 border-t-brand rounded-full animate-spin mx-auto" />
              <p className="mt-4 text-gray-500 dark:text-gray-400">
                Cargando jugadores...
              </p>
            </div>
          ) : filteredPlayers.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No se encontraron jugadores"
              description="No hay jugadores que coincidan con tu búsqueda. Intenta con otros filtros."
              action={
                <Button variant="brand" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-2" />
                  Limpiar Filtros
                </Button>
              }
            />
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPlayers.map((player) => (
                <PlayerCard key={player.id} player={player} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPlayers.map((player) => (
                <PlayerCard key={player.id} player={player} variant="list" />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand to-brand-2 opacity-95" />
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
              href="/sign-up"
              className="inline-flex items-center justify-center gap-2 bg-white text-brand px-8 py-4 rounded-xl font-bold shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300"
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
