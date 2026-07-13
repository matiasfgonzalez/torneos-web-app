"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Trophy, Search, Filter, MapPin, X } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { FilterChipGroup } from "@/components/shared/FilterChips";
import { useUrlFilters } from "@/hooks/use-url-filters";
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

const DEFAULTS = {
  q: "",
  categoria: "Todas",
  estado: "Todos",
  localidad: "Todas",
};

const FiltroTorneos = ({ tournaments }: PropsFiltroTorneos) => {
  // Filtros en la URL (F2): la búsqueda queda compartible y "atrás" deshace un filtro
  const { values, setFilter, clearFilters, hasActiveFilters } =
    useUrlFilters(DEFAULTS);
  const { q, categoria, estado, localidad } = values;

  const localities = Array.from(
    new Set(
      tournaments
        .map((t) => t.locality?.trim())
        .filter((locality): locality is string => !!locality),
    ),
  ).sort((a, b) => a.localeCompare(b, "es"));

  const filteredTournaments = tournaments.filter((tournament) => {
    const term = q.toLowerCase();
    const matchesSearch =
      tournament.name.toLowerCase().includes(term) ||
      tournament.description?.toLowerCase().includes(term) ||
      tournament.locality?.toLowerCase().includes(term);
    const matchesCategory =
      categoria === "Todas" || tournament.ageGroup === categoria;
    const matchesStatus = estado === "Todos" || tournament.status === estado;
    const matchesLocality =
      localidad === "Todas" || tournament.locality === localidad;

    return matchesSearch && matchesCategory && matchesStatus && matchesLocality;
  });

  return (
    <>
      {/* Panel de búsqueda y filtros */}
      <div className="max-w-4xl mx-auto mb-12">
        <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/50 dark:border-gray-700/50">
          <div className="absolute -top-px left-8 right-8 h-1 bg-gradient-to-r from-transparent via-brand to-transparent rounded-full" />

          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-brand to-brand-2 rounded-xl flex items-center justify-center shadow-lg shadow-brand/20 shrink-0">
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
                  className="text-gray-500 hover:text-brand shrink-0"
                >
                  <X className="w-4 h-4 mr-1" />
                  Limpiar
                </Button>
              )}
            </div>

            {/* Búsqueda */}
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-brand transition-colors" />
              <Input
                placeholder="Buscar por nombre, descripción o ubicación..."
                value={q}
                onChange={(e) => setFilter("q", e.target.value)}
                className="pl-12 h-14 text-lg border-2 border-gray-200 dark:border-gray-600 focus:border-brand dark:focus:border-brand rounded-2xl bg-gray-50/50 dark:bg-gray-900/50 focus:bg-white dark:focus:bg-gray-900 transition-all"
              />
            </div>

            {/* Chips: scrollean en mobile, wrap en desktop */}
            <div className="space-y-4">
              <FilterChipGroup
                label="Categoría"
                icon={Filter}
                value={categoria}
                onChange={(v) => setFilter("categoria", v)}
                options={[
                  { value: "Todas", label: "Todas" },
                  ...AGE_GROUP_OPTIONS.map((c) => ({
                    value: c.value,
                    label: c.label,
                  })),
                ]}
              />

              <FilterChipGroup
                label="Estado"
                icon={Trophy}
                value={estado}
                onChange={(v) => setFilter("estado", v)}
                options={[
                  { value: "Todos", label: "Todos" },
                  ...TOURNAMENT_STATUS_OPTIONS.map((s) => ({
                    value: s.value,
                    label: s.label,
                  })),
                ]}
              />

              <FilterChipGroup
                label="Localidad"
                icon={MapPin}
                value={localidad}
                onChange={(v) => setFilter("localidad", v)}
                options={[
                  { value: "Todas", label: "Todas" },
                  ...localities.map((l) => ({ value: l, label: l })),
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Header de resultados */}
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
            {q && (
              <Badge
                variant="secondary"
                className="bg-brand/10 text-brand border-brand/20"
              >
                Búsqueda: {q}
              </Badge>
            )}
            {categoria !== "Todas" && (
              <Badge
                variant="secondary"
                className="bg-brand/10 text-brand border-brand/20"
              >
                {AGE_GROUP_LABELS[categoria as keyof typeof AGE_GROUP_LABELS] ||
                  categoria}
              </Badge>
            )}
            {estado !== "Todos" && (
              <Badge
                variant="secondary"
                className="bg-brand/10 text-brand border-brand/20"
              >
                {TOURNAMENT_STATUS_LABELS[
                  estado as keyof typeof TOURNAMENT_STATUS_LABELS
                ] || estado}
              </Badge>
            )}
            {localidad !== "Todas" && (
              <Badge
                variant="secondary"
                className="bg-brand/10 text-brand border-brand/20"
              >
                <MapPin className="w-3 h-3 mr-1" />
                {localidad}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Grid — anatomía compartida vía TournamentCard (F2) */}
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
