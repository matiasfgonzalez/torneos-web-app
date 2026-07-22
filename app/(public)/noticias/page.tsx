"use client";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Search,
  Calendar,
  User,
  Eye,
  ChevronRight,
  Newspaper,
  Zap,
  Filter,
  X,
  SortAsc,
  TrendingUp,
  Award,
  Clock,
  Grid3X3,
  LayoutList,
  BookOpen,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { PageHero, HeroHighlight } from "@/components/shared/PageHero";
import { formatDate } from "@/lib/formatDate";
import { FullscreenLoading } from "@/components/fullscreen-loading";
import { FilterSelect, FilterGrid } from "@/components/shared/FilterSelect";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { INoticia } from "@modules/noticias/types";

type SortOption = "date-desc" | "date-asc" | "title-asc" | "title-desc";
type ViewMode = "grid" | "list";

const DEFAULTS = { q: "", autor: "", orden: "date-desc" };

export default function NoticiasPage() {
  // Filtros en la URL (F2)
  const { values, setFilter, clearFilters, hasActiveFilters } =
    useUrlFilters(DEFAULTS);
  const { q: searchTerm, autor: selectedAuthor } = values;
  const sortBy = values.orden as SortOption;

  const [noticias, setNoticias] = useState<INoticia[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  useEffect(() => {
    const fetchNoticias = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/noticias", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch noticias");
        }

        const data = await response.json();
        setNoticias(data);
      } catch (err) {
        console.error("Error fetching noticias:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNoticias();
  }, []);

  // Estadísticas
  const stats = useMemo(() => {
    const autores = new Set(noticias.map((n) => n.user?.name).filter(Boolean))
      .size;
    const thisMonth = noticias.filter((n) => {
      const date = new Date(n.publishedAt);
      const now = new Date();
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    }).length;
    return { total: noticias.length, autores, thisMonth };
  }, [noticias]);

  // Autores disponibles
  const autoresDisponibles = useMemo(() => {
    const autores = new Set(noticias.map((n) => n.user?.name).filter(Boolean));
    return Array.from(autores).sort((a, b) => a.localeCompare(b));
  }, [noticias]);

  // Filtrar y ordenar
  const noticiasFiltradas = useMemo(() => {
    const result = noticias.filter((noticia) => {
      const matchesSearch =
        noticia.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        noticia.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        noticia.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        noticia.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesAuthor =
        selectedAuthor === "" || noticia.user?.name === selectedAuthor;

      return matchesSearch && matchesAuthor;
    });

    // Ordenar
    result.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return (
            new Date(b.publishedAt).getTime() -
            new Date(a.publishedAt).getTime()
          );
        case "date-asc":
          return (
            new Date(a.publishedAt).getTime() -
            new Date(b.publishedAt).getTime()
          );
        case "title-asc":
          return a.title.localeCompare(b.title);
        case "title-desc":
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

    return result;
  }, [noticias, searchTerm, selectedAuthor, sortBy]);

  const activeFiltersCount = [selectedAuthor].filter(Boolean).length;

  // Noticia destacada (la más reciente)
  const noticiaDestacada = noticiasFiltradas[0];
  const restOfNoticias = noticiasFiltradas.slice(1);

  if (loading) {
    return <FullscreenLoading isVisible={true} message="Cargando noticias" />;
  }

  return (
    <div className="min-h-screen premium-gradient-bg">
      {/* Hero - componente compartido F0 (patrón §1 de UI_PATTERNS) */}
      <PageHero
        badge={{ icon: Newspaper, text: "Centro de Noticias", endIcon: Zap }}
        title={
          <>
            Últimas <HeroHighlight>Noticias</HeroHighlight>
          </>
        }
        subtitle="Mantente informado con las últimas novedades, resultados y análisis del mundo de los torneos deportivos."
        stats={[
          { icon: BookOpen, value: stats.total, label: "Noticias Publicadas" },
          {
            icon: TrendingUp,
            value: stats.thisMonth,
            label: "Este Mes",
            gradient: "from-green-500 to-emerald-500",
            shadow: "shadow-green-500/20",
          },
          {
            icon: User,
            value: stats.autores,
            label: "Autores",
            gradient: "from-blue-500 to-cyan-500",
            shadow: "shadow-blue-500/20",
          },
        ]}
      />

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
                      Buscar Noticias
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {noticiasFiltradas.length} de {noticias.length} noticias
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
                    htmlFor="search-noticias"
                    className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2"
                  >
                    Buscar
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="search-noticias"
                      type="text"
                      placeholder="Título, contenido, autor..."
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
                    label="Autor"
                    icon={User}
                    value={selectedAuthor}
                    onChange={(v) => setFilter("autor", v)}
                    options={[
                      { value: "", label: "Todos" },
                      ...autoresDisponibles.map((a) => ({
                        value: a ?? "",
                        label: a ?? "",
                      })),
                    ]}
                  />

                  <FilterSelect
                    label="Ordenar por"
                    icon={SortAsc}
                    value={sortBy}
                    onChange={(v) => setFilter("orden", v)}
                    options={[
                      { value: "date-desc", label: "Más recientes" },
                      { value: "date-asc", label: "Más antiguas" },
                      { value: "title-asc", label: "Título (A-Z)" },
                      { value: "title-desc", label: "Título (Z-A)" },
                    ]}
                  />
                </FilterGrid>
              </div>
            </div>
          </div>

          {/* Content */}
          {noticiasFiltradas.length === 0 ? (
            <div className="text-center py-20">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-br from-brand/20 to-brand-2/20 rounded-full blur-2xl" />
                <div className="relative w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <Newspaper className="w-12 h-12 text-gray-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                No se encontraron noticias
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                No hay noticias que coincidan con tu búsqueda. Intenta con otros
                filtros.
              </p>
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand to-brand-2 text-white font-semibold rounded-xl shadow-lg shadow-brand/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
              >
                <X className="w-4 h-4" />
                Limpiar Filtros
              </button>
            </div>
          ) : (
            <>
              {/* Featured Article */}
              {noticiaDestacada && viewMode === "grid" && (
                <div className="mb-12">
                  <h2 className="text-sm font-semibold text-brand uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Noticia Destacada
                  </h2>
                  <Link
                    href={`/noticias/${noticiaDestacada.id}`}
                    className="group block"
                  >
                    <Card className="overflow-hidden border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                      <div className="grid md:grid-cols-2 gap-0">
                        <div className="relative h-64 md:h-auto">
                          <img
                            src={
                              noticiaDestacada.coverImageUrl ||
                              "/placeholder.svg"
                            }
                            alt={noticiaDestacada.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent md:hidden" />
                        </div>
                        <div className="p-8 flex flex-col justify-center">
                          <div className="flex items-center gap-3 mb-4">
                            <Badge className="bg-gradient-to-r from-brand to-brand-2 text-white border-0">
                              {noticiaDestacada.user?.name || "Anónimo"}
                            </Badge>
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                              <Clock className="w-4 h-4 mr-1" />
                              {formatDate(
                                noticiaDestacada.publishedAt,
                                "dd/MM/yyyy",
                              )}
                            </div>
                          </div>
                          <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-brand transition-colors mb-4 line-clamp-2">
                            {noticiaDestacada.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 mb-6 line-clamp-3">
                            {noticiaDestacada.summary}
                          </p>
                          <div className="flex items-center text-brand font-semibold group-hover:gap-3 gap-2 transition-all">
                            <span>Leer artículo completo</span>
                            <ChevronRight className="w-5 h-5" />
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </div>
              )}

              {/* News Grid/List */}
              {viewMode === "grid" ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(noticiaDestacada ? restOfNoticias : noticiasFiltradas).map(
                    (noticia) => (
                      <Link
                        key={noticia.id}
                        href={`/noticias/${noticia.id}`}
                        className="group block h-full"
                      >
                        <Card className="h-full border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 overflow-hidden group-hover:-translate-y-1">
                          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand to-brand-2 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />

                          <div className="relative h-48">
                            <img
                              src={noticia.coverImageUrl || "/placeholder.svg"}
                              alt={noticia.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                              <Badge className="bg-white/90 text-gray-900 border-0">
                                {noticia.user?.name || "Anónimo"}
                              </Badge>
                            </div>
                          </div>

                          <div className="p-6">
                            <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-3">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {formatDate(noticia.publishedAt, "dd/MM/yyyy")}
                              </div>
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-brand transition-colors mb-3 line-clamp-2">
                              {noticia.title}
                            </h3>

                            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4">
                              {noticia.summary}
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700/50">
                              <div className="text-xs text-gray-400">
                                {formatDate(noticia.updatedAt, "dd/MM/yyyy")}
                              </div>
                              <div className="flex items-center gap-1 text-brand group-hover:text-brand-mid transition-colors">
                                <Eye className="w-4 h-4" />
                                <ChevronRight className="w-4 h-4" />
                              </div>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    ),
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {noticiasFiltradas.map((noticia) => (
                    <Link
                      key={noticia.id}
                      href={`/noticias/${noticia.id}`}
                      className="group block"
                    >
                      <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
                        <div className="flex flex-col md:flex-row">
                          <div className="relative w-full md:w-64 h-48 md:h-auto flex-shrink-0">
                            <img
                              src={noticia.coverImageUrl || "/placeholder.svg"}
                              alt={noticia.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                          <div className="flex-1 p-6">
                            <div className="flex items-center gap-3 mb-3">
                              <Badge className="bg-gradient-to-r from-brand to-brand-2 text-white border-0">
                                {noticia.user?.name || "Anónimo"}
                              </Badge>
                              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                <Calendar className="w-4 h-4 mr-1" />
                                {formatDate(noticia.publishedAt, "dd/MM/yyyy")}
                              </div>
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-brand transition-colors mb-3">
                              {noticia.title}
                            </h3>

                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                              {noticia.summary}
                            </p>

                            <div className="flex items-center justify-between">
                              <div className="text-sm text-gray-400">
                                Actualizada:{" "}
                                {formatDate(noticia.updatedAt, "dd/MM/yyyy")}
                              </div>
                              <div className="flex items-center gap-2 text-brand font-medium group-hover:gap-3 transition-all">
                                <span>Leer más</span>
                                <ChevronRight className="w-4 h-4" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </>
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
            ¿Tienes una Historia que Contar?
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Comparte las últimas noticias y mantén a la comunidad informada
            sobre todo lo que sucede en el mundo deportivo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 bg-white text-brand px-8 py-4 rounded-xl font-bold shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300"
            >
              <TrendingUp className="w-5 h-5" />
              Publicar Noticia
            </Link>
            <Link
              href="/torneos"
              className="inline-flex items-center justify-center gap-2 bg-white/20 backdrop-blur-xl text-white px-8 py-4 rounded-xl font-bold border border-white/30 hover:bg-white/30 transition-all duration-300"
            >
              Ver Torneos
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
