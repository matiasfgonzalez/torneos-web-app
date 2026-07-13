"use client";

import { useState, useMemo } from "react";
import { ITeam } from "@modules/equipos/types/types";
import TeamCard from "./TeamCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { FilterChipGroup } from "@/components/shared/FilterChips";
import { useUrlFilters } from "@/hooks/use-url-filters";
import {
  Search,
  Shield,
  Filter,
  X,
  MapPin,
  SortAsc,
  Grid3X3,
  LayoutList,
} from "lucide-react";

interface TeamsListProps {
  readonly initialTeams: ITeam[];
}

type SortOption = "name-asc" | "name-desc" | "city-asc" | "city-desc";
type ViewMode = "grid" | "list";

const DEFAULTS = { q: "", ciudad: "", orden: "name-asc" };

export default function TeamsList({ initialTeams }: TeamsListProps) {
  // Filtros en la URL (F2)
  const { values, setFilter, clearFilters, hasActiveFilters } =
    useUrlFilters(DEFAULTS);
  const { q: searchTerm, ciudad: selectedCity } = values;
  const sortBy = values.orden as SortOption;

  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Obtener ciudades únicas para el filtro
  const ciudadesDisponibles = useMemo(() => {
    const ciudades = new Set(
      initialTeams.map((t) => t.homeCity).filter(Boolean),
    );
    return Array.from(ciudades).sort((a, b) =>
      (a || "").localeCompare(b || ""),
    );
  }, [initialTeams]);

  // Filtrar y ordenar equipos
  const filteredTeams = useMemo(() => {
    const teams = initialTeams.filter(
      (team) =>
        (team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          team.homeCity?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          team.coach?.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (selectedCity === "" || team.homeCity === selectedCity),
    );

    // Ordenar
    teams.sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "city-asc":
          return (a.homeCity || "").localeCompare(b.homeCity || "");
        case "city-desc":
          return (b.homeCity || "").localeCompare(a.homeCity || "");
        default:
          return 0;
      }
    });

    return teams;
  }, [initialTeams, searchTerm, selectedCity, sortBy]);

  const activeFiltersCount = [selectedCity].filter(Boolean).length;

  return (
    <div className="space-y-8">
      {/* Premium Search & Filter Panel */}
      <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/50 dark:border-gray-700/50 shadow-xl p-6">
        {/* Decorative gradient corner */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-brand/10 to-brand-2/10 rounded-tr-2xl rounded-bl-full" />

        <div className="relative">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-brand to-brand-2 rounded-xl flex items-center justify-center shadow-lg shadow-brand/20">
                <Filter className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">
                  Buscar Equipos
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {filteredTeams.length} de {initialTeams.length} equipos
                </p>
              </div>
            </div>

            {/* View Mode Toggle & Clear Filters */}
            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === "grid"
                      ? "bg-white dark:bg-gray-600 shadow-sm text-brand"
                      : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === "list"
                      ? "bg-white dark:bg-gray-600 shadow-sm text-brand"
                      : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                  }`}
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
                htmlFor="search-teams"
                className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2"
              >
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="search-teams"
                  type="text"
                  placeholder="Nombre, ciudad o entrenador..."
                  className="pl-10 h-11 rounded-xl border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all"
                  value={searchTerm}
                  onChange={(e) => setFilter("q", e.target.value)}
                />
              </div>
            </div>

            {/* Chips: scrollean en mobile, wrap en desktop */}
            <FilterChipGroup
              label="Ciudad"
              icon={MapPin}
              value={selectedCity}
              onChange={(v) => setFilter("ciudad", v)}
              options={[
                { value: "", label: "Todas" },
                ...ciudadesDisponibles.map((c) => ({
                  value: c ?? "",
                  label: c ?? "",
                })),
              ]}
            />

            <FilterChipGroup
              label="Ordenar por"
              icon={SortAsc}
              value={sortBy}
              onChange={(v) => setFilter("orden", v)}
              options={[
                { value: "name-asc", label: "Nombre (A-Z)" },
                { value: "name-desc", label: "Nombre (Z-A)" },
                { value: "city-asc", label: "Ciudad (A-Z)" },
                { value: "city-desc", label: "Ciudad (Z-A)" },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Results */}
      {filteredTeams.length === 0 ? (
        <EmptyState
          icon={Shield}
          title="No se encontraron equipos"
          description="No hay equipos que coincidan con tu búsqueda. Intenta con otros filtros."
          action={
            <Button variant="brand" onClick={clearFilters}>
              <X className="w-4 h-4 mr-2" />
              Limpiar Filtros
            </Button>
          }
        />
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
              : "grid grid-cols-1 sm:grid-cols-2 gap-4"
          }
        >
          {filteredTeams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      )}
    </div>
  );
}
