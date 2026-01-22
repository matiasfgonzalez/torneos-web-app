"use client";

import { useState } from "react";
import Link from "next/link";
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
import {
  Calendar,
  Trophy,
  Users,
  Search,
  Filter,
  MapPin,
  Shield,
  Eye,
  ChevronRight,
  Sparkles,
  Clock,
  X,
} from "lucide-react";
import { ITorneo } from "@modules/torneos/types";
import {
  TOURNAMENT_STATUS_OPTIONS,
  TOURNAMENT_STATUS_LABELS,
  TOURNAMENT_CATEGORIES_OPTIONS,
  TOURNAMENT_CATEGORY_LABELS,
  TOURNAMENT_FORMAT_LABELS,
} from "@/lib/constants";
import { formatDate } from "@/lib/formatDate";

interface PropsFiltroTorneos {
  tournaments: ITorneo[];
}

// Colores de estado
const statusColors: Record<string, string> = {
  ACTIVO:
    "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-green-500/25",
  INSCRIPCION:
    "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-blue-500/25",
  PENDIENTE:
    "bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] text-white shadow-[#ad45ff]/25",
  FINALIZADO: "bg-gray-500 text-white",
  SUSPENDIDO: "bg-orange-500 text-white",
  CANCELADO: "bg-red-500 text-white",
  BORRADOR: "bg-gray-400 text-white",
  ARCHIVADO: "bg-gray-600 text-white",
};

const FiltroTorneos = (props: PropsFiltroTorneos) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [selectedStatus, setSelectedStatus] = useState("Todos");

  const { tournaments } = props;

  const filteredTournaments = tournaments.filter((tournament) => {
    const matchesSearch =
      tournament.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tournament.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "Todas" || tournament.category === selectedCategory;
    const matchesStatus =
      selectedStatus === "Todos" || tournament.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("Todas");
    setSelectedStatus("Todos");
  };

  const hasActiveFilters =
    searchTerm || selectedCategory !== "Todas" || selectedStatus !== "Todos";

  return (
    <>
      {/* Search Section - Premium Glassmorphism Card */}
      <div className="max-w-4xl mx-auto mb-12">
        <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50 dark:border-gray-700/50">
          {/* Decorative gradient */}
          <div className="absolute -top-px left-8 right-8 h-1 bg-gradient-to-r from-transparent via-[#ad45ff] to-transparent rounded-full" />

          <div className="space-y-6">
            {/* Search Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#ad45ff] to-[#a3b3ff] rounded-xl flex items-center justify-center shadow-lg shadow-[#ad45ff]/20">
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
                  className="text-gray-500 hover:text-[#ad45ff]"
                >
                  <X className="w-4 h-4 mr-1" />
                  Limpiar
                </Button>
              )}
            </div>

            {/* Search Input */}
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-[#ad45ff] transition-colors" />
              <Input
                placeholder="Buscar por nombre, descripción o ubicación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-14 text-lg border-2 border-gray-200 dark:border-gray-600 focus:border-[#ad45ff] dark:focus:border-[#ad45ff] rounded-2xl bg-gray-50/50 dark:bg-gray-900/50 focus:bg-white dark:focus:bg-gray-900 transition-all"
              />
            </div>

            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="flex-1 h-12 border-2 border-gray-200 dark:border-gray-600 focus:border-[#ad45ff] rounded-xl bg-gray-50/50 dark:bg-gray-900/50 hover:bg-white dark:hover:bg-gray-900 transition-all">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-[#ad45ff]" />
                    <SelectValue placeholder="Categoría" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl border-2 shadow-xl max-h-80">
                  <SelectItem value="Todas" className="rounded-lg">
                    Todas las categorías
                  </SelectItem>
                  {TOURNAMENT_CATEGORIES_OPTIONS.map((category) => (
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
                <SelectTrigger className="flex-1 h-12 border-2 border-gray-200 dark:border-gray-600 focus:border-[#ad45ff] rounded-xl bg-gray-50/50 dark:bg-gray-900/50 hover:bg-white dark:hover:bg-gray-900 transition-all">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-[#ad45ff]" />
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
            </div>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-gradient-to-b from-[#ad45ff] to-[#a3b3ff] rounded-full" />
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
                className="bg-[#ad45ff]/10 text-[#ad45ff] border-[#ad45ff]/20"
              >
                Búsqueda: {searchTerm}
              </Badge>
            )}
            {selectedCategory !== "Todas" && (
              <Badge
                variant="secondary"
                className="bg-[#ad45ff]/10 text-[#ad45ff] border-[#ad45ff]/20"
              >
                {TOURNAMENT_CATEGORY_LABELS[
                  selectedCategory as keyof typeof TOURNAMENT_CATEGORY_LABELS
                ] || selectedCategory}
              </Badge>
            )}
            {selectedStatus !== "Todos" && (
              <Badge
                variant="secondary"
                className="bg-[#ad45ff]/10 text-[#ad45ff] border-[#ad45ff]/20"
              >
                {TOURNAMENT_STATUS_LABELS[
                  selectedStatus as keyof typeof TOURNAMENT_STATUS_LABELS
                ] || selectedStatus}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Tournaments Grid - Premium Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredTournaments.map((tournament, index) => (
          <article
            key={tournament.id}
            className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden border border-gray-100 dark:border-gray-700"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Card Header with Logo/Image */}
            <div className="relative h-32 bg-gradient-to-br from-[#ad45ff]/10 via-[#c77dff]/10 to-[#a3b3ff]/10 dark:from-[#ad45ff]/20 dark:via-[#c77dff]/20 dark:to-[#a3b3ff]/20">
              {/* Decorative pattern */}
              <div className="absolute inset-0 opacity-30">
                <div className="absolute top-4 right-4 w-20 h-20 border-2 border-[#ad45ff]/20 rounded-full" />
                <div className="absolute bottom-4 left-4 w-12 h-12 border-2 border-[#a3b3ff]/20 rounded-full" />
              </div>

              {/* Logo */}
              <div className="absolute bottom-0 left-6 transform translate-y-1/2">
                <div className="w-20 h-20 bg-white dark:bg-gray-700 rounded-2xl shadow-xl border-4 border-white dark:border-gray-800 overflow-hidden flex items-center justify-center">
                  {tournament.logoUrl ? (
                    <img
                      src={tournament.logoUrl}
                      alt={tournament.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Trophy className="w-8 h-8 text-[#ad45ff]" />
                  )}
                </div>
              </div>

              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                <Badge
                  className={`${statusColors[tournament.status] || "bg-gray-400 text-white"} shadow-lg font-semibold`}
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  {TOURNAMENT_STATUS_LABELS[
                    tournament.status as keyof typeof TOURNAMENT_STATUS_LABELS
                  ] || tournament.status}
                </Badge>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-6 pt-14">
              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-[#ad45ff] transition-colors line-clamp-2 mb-3">
                {tournament.name}
              </h3>

              {/* Category and Location Pills */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge
                  variant="outline"
                  className="border-2 border-[#ad45ff]/30 text-[#ad45ff] font-medium"
                >
                  {TOURNAMENT_CATEGORY_LABELS[
                    tournament.category as keyof typeof TOURNAMENT_CATEGORY_LABELS
                  ] || tournament.category}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{tournament.locality}</span>
                </div>
              </div>

              {/* Description */}
              {tournament.description && (
                <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-4">
                  {tournament.description}
                </p>
              )}

              {/* Details Grid */}
              <div className="space-y-3 border-t border-gray-100 dark:border-gray-700 pt-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Calendar className="h-4 w-4 text-[#ad45ff]" />
                    <span>Inicio</span>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatDate(tournament.startDate, "dd MMM yyyy")}
                  </span>
                </div>

                {tournament.nextMatch && (
                  <div className="flex items-center justify-between text-sm bg-[#ad45ff]/5 dark:bg-[#ad45ff]/10 -mx-6 px-6 py-2">
                    <div className="flex items-center gap-2 text-[#ad45ff]">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">Próximo partido</span>
                    </div>
                    <span className="font-bold text-[#ad45ff]">
                      {formatDate(tournament.nextMatch, "dd MMM")}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Users className="h-4 w-4 text-[#ad45ff]" />
                    <span>Formato</span>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {TOURNAMENT_FORMAT_LABELS[
                      tournament.format as keyof typeof TOURNAMENT_FORMAT_LABELS
                    ] || tournament.format}
                  </span>
                </div>

                {tournament.liga && (
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Shield className="h-4 w-4 text-[#ad45ff]" />
                      <span>Liga</span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white truncate max-w-[150px]">
                      {tournament.liga}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="mt-6">
                <Button
                  className="w-full bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] hover:from-[#9d35ef] hover:to-[#93a3ef] text-white rounded-xl h-12 font-semibold shadow-lg shadow-[#ad45ff]/20 hover:shadow-xl hover:shadow-[#ad45ff]/30 transition-all group/btn"
                  asChild
                >
                  <Link href={`/torneos/${tournament.id}`}>
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Torneo
                    <ChevronRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* No Results - Premium Empty State */}
      {filteredTournaments.length === 0 && (
        <div className="text-center py-20">
          <div className="relative inline-block">
            <div className="w-32 h-32 bg-gradient-to-br from-[#ad45ff]/10 to-[#a3b3ff]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="h-16 w-16 text-[#ad45ff]" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-[#ad45ff] to-[#a3b3ff] rounded-full flex items-center justify-center shadow-lg">
              <Search className="w-4 h-4 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            No se encontraron torneos
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            No hay torneos que coincidan con tus criterios de búsqueda. Intenta
            ajustar los filtros.
          </p>
          <Button
            onClick={clearFilters}
            className="bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] text-white rounded-xl"
          >
            <X className="w-4 h-4 mr-2" />
            Limpiar Filtros
          </Button>
        </div>
      )}
    </>
  );
};

export default FiltroTorneos;
