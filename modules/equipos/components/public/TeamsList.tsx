"use client";

import { useState, useMemo } from "react";
import { ITeam } from "@modules/equipos/types/types";
import TeamCard from "./TeamCard";
import { Input } from "@/components/ui/input";
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

export default function TeamsList({ initialTeams }: TeamsListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortOption>("name-asc");
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
    let teams = initialTeams.filter(
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

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCity("");
    setSortBy("name-asc");
  };

  return (
    <div className="space-y-8">
      {/* Premium Search & Filter Panel */}
      <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/50 dark:border-gray-700/50 shadow-xl p-6">
        {/* Decorative gradient corner */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#ad45ff]/10 to-[#a3b3ff]/10 rounded-tr-2xl rounded-bl-full" />

        <div className="relative">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#ad45ff] to-[#a3b3ff] rounded-xl flex items-center justify-center shadow-lg shadow-[#ad45ff]/20">
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
                      ? "bg-white dark:bg-gray-600 shadow-sm text-[#ad45ff]"
                      : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === "list"
                      ? "bg-white dark:bg-gray-600 shadow-sm text-[#ad45ff]"
                      : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                  }`}
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

          {/* Search and Filters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Input */}
            <div className="md:col-span-1">
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
                  className="pl-10 h-11 rounded-xl border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-[#ad45ff]/30 focus:border-[#ad45ff] transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* City Filter */}
            <div>
              <label
                htmlFor="filter-city"
                className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2"
              >
                <MapPin className="w-3.5 h-3.5 inline mr-1" />
                Ciudad
              </label>
              <select
                id="filter-city"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full h-11 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 text-sm focus:ring-2 focus:ring-[#ad45ff]/30 focus:border-[#ad45ff] transition-all"
              >
                <option value="">Todas las ciudades</option>
                {ciudadesDisponibles.map((ciudad) => (
                  <option key={ciudad} value={ciudad}>
                    {ciudad}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label
                htmlFor="sort-teams"
                className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2"
              >
                <SortAsc className="w-3.5 h-3.5 inline mr-1" />
                Ordenar por
              </label>
              <select
                id="sort-teams"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full h-11 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 text-sm focus:ring-2 focus:ring-[#ad45ff]/30 focus:border-[#ad45ff] transition-all"
              >
                <option value="name-asc">Nombre (A-Z)</option>
                <option value="name-desc">Nombre (Z-A)</option>
                <option value="city-asc">Ciudad (A-Z)</option>
                <option value="city-desc">Ciudad (Z-A)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {filteredTeams.length === 0 ? (
        <div className="text-center py-20">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-br from-[#ad45ff]/20 to-[#a3b3ff]/20 rounded-full blur-2xl" />
            <div className="relative w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Shield className="w-12 h-12 text-gray-400" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            No se encontraron equipos
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
            No hay equipos que coincidan con tu búsqueda. Intenta con otros
            filtros.
          </p>
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] text-white font-semibold rounded-xl shadow-lg shadow-[#ad45ff]/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
          >
            <X className="w-4 h-4" />
            Limpiar Filtros
          </button>
        </div>
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
