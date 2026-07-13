"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trophy, Search, Filter, MapPin, X } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { TournamentCard } from "@modules/torneos/components/TournamentCard";
import { ITorneo } from "@modules/torneos/types";
import {
  TOURNAMENT_STATUS_OPTIONS,
  TOURNAMENT_STATUS_LABELS,
  AGE_GROUP_OPTIONS,
  AGE_GROUP_LABELS,
} from "@/lib/constants";

interface PropsFiltroTorneos {
  tournaments: ITorneo[];
}

const FiltroTorneos = (props: PropsFiltroTorneos) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [selectedStatus, setSelectedStatus] = useState("Todos");
  const [selectedLocality, setSelectedLocality] = useState("Todas");

  const { tournaments } = props;

  const localities = Array.from(
    new Set(
      tournaments
        .map((t) => t.locality?.trim())
        .filter((locality): locality is string => !!locality),
    ),
  ).sort((a, b) => a.localeCompare(b, "es"));

  const filteredTournaments = tournaments.filter((tournament) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      tournament.name.toLowerCase().includes(term) ||
      tournament.description?.toLowerCase().includes(term) ||
      tournament.locality?.toLowerCase().includes(term);
    const matchesCategory =
      selectedCategory === "Todas" || tournament.ageGroup === selectedCategory;
    const matchesStatus =
      selectedStatus === "Todos" || tournament.status === selectedStatus;
    const matchesLocality =
      selectedLocality === "Todas" || tournament.locality === selectedLocality;

    return matchesSearch && matchesCategory && matchesStatus && matchesLocality;
  });

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("Todas");
    setSelectedStatus("Todos");
    setSelectedLocality("Todas");
  };

  const hasActiveFilters =
    searchTerm ||
    selectedCategory !== "Todas" ||
    selectedStatus !== "Todos" ||
    selectedLocality !== "Todas";

  return (
    <>
      {/* Search Section - Premium Glassmorphism Card */}
      <div className="max-w-4xl mx-auto mb-12">
        <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50 dark:border-gray-700/50">
          {/* Decorative gradient */}
          <div className="absolute -top-px left-8 right-8 h-1 bg-gradient-to-r from-transparent via-brand to-transparent rounded-full" />

          <div className="space-y-6">
            {/* Search Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-brand to-brand-2 rounded-xl flex items-center justify-center shadow-lg shadow-brand/20">
                  <Search className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    Buscar Torneos
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Encuentra el torneo perfecto para ti
                  </p>
                </div>
              </div>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-gray-500 hover:text-brand"
                >
                  <X className="w-4 h-4 mr-1" />
                  Limpiar
                </Button>
              )}
            </div>

            {/* Search Input */}
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-brand transition-colors" />
              <Input
                placeholder="Buscar por nombre, descripción o ubicación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-14 text-lg border-2 border-gray-200 dark:border-gray-600 focus:border-brand dark:focus:border-brand rounded-2xl bg-gray-50/50 dark:bg-gray-900/50 focus:bg-white dark:focus:bg-gray-900 transition-all"
              />
            </div>

            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="flex-1 h-12 border-2 border-gray-200 dark:border-gray-600 focus:border-brand rounded-xl bg-gray-50/50 dark:bg-gray-900/50 hover:bg-white dark:hover:bg-gray-900 transition-all">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-brand" />
                    <SelectValue placeholder="Categoría" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl border-2 shadow-xl max-h-80">
                  <SelectItem value="Todas" className="rounded-lg">
                    Todas las categorías
                  </SelectItem>
                  {AGE_GROUP_OPTIONS.map((category) => (
                    <SelectItem
                      key={category.value}
                      value={category.value}
                      className="rounded-lg"
                    >
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="flex-1 h-12 border-2 border-gray-200 dark:border-gray-600 focus:border-brand rounded-xl bg-gray-50/50 dark:bg-gray-900/50 hover:bg-white dark:hover:bg-gray-900 transition-all">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-brand" />
                    <SelectValue placeholder="Estado" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl border-2 shadow-xl">
                  <SelectItem value="Todos" className="rounded-lg">
                    Todos los estados
                  </SelectItem>
                  {TOURNAMENT_STATUS_OPTIONS.map((status) => (
                    <SelectItem
                      key={status.value}
                      value={status.value}
                      className="rounded-lg"
                    >
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {localities.length > 0 && (
                <Select
                  value={selectedLocality}
                  onValueChange={setSelectedLocality}
                >
                  <SelectTrigger className="flex-1 h-12 border-2 border-gray-200 dark:border-gray-600 focus:border-brand rounded-xl bg-gray-50/50 dark:bg-gray-900/50 hover:bg-white dark:hover:bg-gray-900 transition-all">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-brand" />
                      <SelectValue placeholder="Localidad" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-2 shadow-xl max-h-80">
                    <SelectItem value="Todas" className="rounded-lg">
                      Todas las localidades
                    </SelectItem>
                    {localities.map((locality) => (
                      <SelectItem
                        key={locality}
                        value={locality}
                        className="rounded-lg"
                      >
                        {locality}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-gradient-to-b from-brand to-brand-2 rounded-full" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {filteredTournaments.length} Torneo
              {filteredTournaments.length === 1 ? "" : "s"}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {hasActiveFilters
                ? "Filtros aplicados"
                : "Mostrando todos los torneos"}
            </p>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            {searchTerm && (
              <Badge
                variant="secondary"
                className="bg-brand/10 text-brand border-brand/20"
              >
                Búsqueda: {searchTerm}
              </Badge>
            )}
            {selectedCategory !== "Todas" && (
              <Badge
                variant="secondary"
                className="bg-brand/10 text-brand border-brand/20"
              >
                {AGE_GROUP_LABELS[
                  selectedCategory as keyof typeof AGE_GROUP_LABELS
                ] || selectedCategory}
              </Badge>
            )}
            {selectedStatus !== "Todos" && (
              <Badge
                variant="secondary"
                className="bg-brand/10 text-brand border-brand/20"
              >
                {TOURNAMENT_STATUS_LABELS[
                  selectedStatus as keyof typeof TOURNAMENT_STATUS_LABELS
                ] || selectedStatus}
              </Badge>
            )}
            {selectedLocality !== "Todas" && (
              <Badge
                variant="secondary"
                className="bg-brand/10 text-brand border-brand/20"
              >
                <MapPin className="w-3 h-3 mr-1" />
                {selectedLocality}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Tournaments Grid - anatomía compartida vía TournamentCard (F2) */}
      {filteredTournaments.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="No se encontraron torneos"
          description="No hay torneos que coincidan con tus criterios de búsqueda. Intenta ajustar los filtros."
          action={
            <Button variant="brand" onClick={clearFilters}>
              <X className="w-4 h-4 mr-2" />
              Limpiar Filtros
            </Button>
          }
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTournaments.map((tournament) => (
            <TournamentCard key={tournament.id} tournament={tournament} />
          ))}
        </div>
      )}
    </>
  );
};

export default FiltroTorneos;
