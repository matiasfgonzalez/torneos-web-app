"use client";

import { useCallback, useMemo, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  FilterSelect,
  FilterGrid,
  type FilterOption,
} from "@/components/shared/FilterSelect";
import { cn } from "@/lib/utils";

/**
 * Tabla común del panel (F3) — patrón §4b de docs/UI_PATTERNS.md.
 *
 * Resuelve de una vez lo que cada tabla del admin reimplementaba a mano:
 * búsqueda, filtros, **orden por columna**, **paginación** y **colapso a
 * cards en mobile** (una tabla de 7 columnas es ilegible en 375px).
 *
 * Dos modos:
 * - **Cliente (default):** recibe TODAS las filas y ordena/filtra/pagina en
 *   memoria. Alcanza para volúmenes acotados (listas org-scoped).
 * - **Server (M7):** se pasa el prop `server`. Las filas ya vienen paginadas del
 *   server component; búsqueda/filtros/orden/página se guardan en la **URL**
 *   (`?q`/`?<filtro>`/`?sort`/`?dir`/`?page`) y cada cambio navega para que el
 *   server rehaga la query de Prisma. El estado queda compartible por link.
 *   (Ver [lib/tableParams.ts](../../lib/tableParams.ts) para el parseo.)
 */

export interface DataTableColumn<T> {
  id: string;
  header: React.ReactNode;
  cell: (row: T) => React.ReactNode;
  /** Devolver un valor comparable habilita el orden por esta columna. */
  sortValue?: (row: T) => string | number;
  align?: "left" | "center" | "right";
  /**
   * Oculta la columna por debajo del breakpoint (la tabla no debe scrollear en
   * horizontal). Sólo `lg`/`xl`: por debajo de `md` no se muestra la tabla sino
   * las cards.
   */
  hideBelow?: "lg" | "xl";
  /** En la card de mobile: ocultar esta columna (ej. la de acciones ya va en el footer). */
  hideOnCard?: boolean;
  /** Etiqueta para la card de mobile (default: `header` si es texto). */
  cardLabel?: string;
}

export interface DataTableFilter<T> {
  id: string;
  label: string;
  icon?: LucideIcon;
  options: FilterOption[];
  /**
   * `value` es el `FilterOption.value` elegido; se llama solo si no es el
   * default. **Solo se usa en modo cliente** (en server el filtro va a la query).
   */
  test?: (row: T, value: string) => boolean;
  /** Valor "sin filtrar". Default: "all". */
  defaultValue?: string;
}

/**
 * Estado server-side que arma el server component desde la URL. Cuando está
 * presente, la tabla pasa a modo server: no filtra en memoria y las mutaciones
 * de búsqueda/filtro/orden/página navegan cambiando los query params.
 */
export interface DataTableServer {
  /** Total de filas que matchean los filtros actuales (para paginar). */
  total: number;
  /** Página 1-based actual. */
  page: number;
  pageSize: number;
  /** Texto de búsqueda actual (seed del input). */
  q: string;
  /** Columna de orden (id) actual, o null. */
  sort: string | null;
  dir: "asc" | "desc";
  /** Valor actual de cada filtro por su id. */
  filterValues: Record<string, string>;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;

  /** Encabezado de la Card contenedora */
  icon?: LucideIcon;
  title?: string;
  description?: string;
  /** Acción principal (ej. botón de creación) */
  actions?: React.ReactNode;

  /** Búsqueda por texto libre: devolver el texto sobre el que se busca. */
  searchable?: { placeholder: string; getText?: (row: T) => string };
  filters?: DataTableFilter<T>[];

  /** 0 = sin paginación. Default: 10. */
  pageSize?: number;

  /**
   * Activa el modo server-side (M7). Con esto, `rows` es la página actual ya
   * consultada y el estado (búsqueda/filtros/orden/página) se sincroniza con la
   * URL en vez de filtrarse en memoria.
   */
  server?: DataTableServer;

  empty: {
    icon: LucideIcon;
    title: string;
    description?: string;
    /** Copy alternativo cuando hay filtros aplicados (no es lo mismo "sin datos" que "sin resultados"). */
    filteredTitle?: string;
    filteredDescription?: string;
    action?: React.ReactNode;
  };

  /** Card de mobile a medida. Si se omite, se arma con las columnas. */
  renderCard?: (row: T) => React.ReactNode;
  /** Acciones por fila, repetidas en el footer de la card de mobile. */
  rowActions?: (row: T) => React.ReactNode;
}

type SortState = { columnId: string; dir: "asc" | "desc" } | null;

const HIDE_BELOW: Record<
  NonNullable<DataTableColumn<unknown>["hideBelow"]>,
  string
> = {
  lg: "hidden lg:table-cell",
  xl: "hidden xl:table-cell",
};

const ALIGN: Record<NonNullable<DataTableColumn<unknown>["align"]>, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

const SEARCH_DEBOUNCE_MS = 350;

export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  icon: Icon,
  title,
  description,
  actions,
  searchable,
  filters,
  pageSize = 10,
  server,
  empty,
  renderCard,
  rowActions,
}: DataTableProps<T>) {
  const serverMode = !!server;

  // --- Navegación (solo relevante en modo server). Los hooks se llaman siempre
  //     para no romper las reglas de hooks; en modo cliente quedan sin uso. ---
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const pushParams = useCallback(
    (updates: Record<string, string | null>, resetPage = true) => {
      const params = new URLSearchParams(searchParams?.toString() ?? "");
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") params.delete(key);
        else params.set(key, value);
      }
      // Cualquier cambio de filtro/búsqueda/orden vuelve a la página 1 (salvo que
      // se esté paginando explícitamente).
      if (resetPage && !("page" in updates)) params.delete("page");
      const qs = params.toString();
      startTransition(() => {
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    },
    [router, pathname, searchParams],
  );

  // --- Estado local (modo cliente) ---
  const [clientSearch, setClientSearch] = useState("");
  const [clientFilterValues, setClientFilterValues] = useState<
    Record<string, string>
  >(() =>
    Object.fromEntries((filters ?? []).map((f) => [f.id, f.defaultValue ?? "all"])),
  );
  const [clientSort, setClientSort] = useState<SortState>(null);
  const [clientPage, setClientPage] = useState(1);

  // --- Input de búsqueda: estado local en ambos modos; en server se debouncea
  //     a la URL. Se resincroniza con `server.q` cuando cambia por navegación
  //     externa (ej. "Limpiar filtros") usando el patrón prev-prop (sin effect). ---
  const [searchInput, setSearchInput] = useState(serverMode ? server!.q : "");
  const [lastServerQ, setLastServerQ] = useState(serverMode ? server!.q : "");
  if (serverMode && server!.q !== lastServerQ) {
    setLastServerQ(server!.q);
    setSearchInput(server!.q);
  }
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = serverMode ? searchInput : clientSearch;

  const onSearchChange = (value: string) => {
    setSearchInput(value);
    if (!serverMode) {
      setClientSearch(value);
      setClientPage(1);
      return;
    }
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(
      () => pushParams({ q: value || null }),
      SEARCH_DEBOUNCE_MS,
    );
  };

  const filterValueOf = (f: DataTableFilter<T>) =>
    serverMode
      ? (server!.filterValues[f.id] ?? f.defaultValue ?? "all")
      : (clientFilterValues[f.id] ?? f.defaultValue ?? "all");

  const onFilterChange = (f: DataTableFilter<T>, value: string) => {
    if (!serverMode) {
      setClientFilterValues((prev) => ({ ...prev, [f.id]: value }));
      setClientPage(1);
      return;
    }
    pushParams({ [f.id]: value === (f.defaultValue ?? "all") ? null : value });
  };

  const activeSort: SortState = serverMode
    ? server!.sort
      ? { columnId: server!.sort, dir: server!.dir }
      : null
    : clientSort;

  const toggleSort = (col: DataTableColumn<T>) => {
    if (!col.sortValue) return;
    if (!serverMode) {
      setClientPage(1);
      setClientSort((prev) => {
        if (prev?.columnId !== col.id) return { columnId: col.id, dir: "asc" };
        if (prev.dir === "asc") return { columnId: col.id, dir: "desc" };
        return null; // tercer click: sin orden
      });
      return;
    }
    // Server: mismo ciclo asc → desc → sin orden, pero a la URL.
    if (activeSort?.columnId !== col.id) {
      pushParams({ sort: col.id, dir: "asc" });
    } else if (activeSort.dir === "asc") {
      pushParams({ sort: col.id, dir: "desc" });
    } else {
      pushParams({ sort: null, dir: null });
    }
  };

  // --- Derivados de modo cliente (filtrar/ordenar/paginar en memoria) ---
  const filtered = useMemo(() => {
    if (serverMode) return rows;
    const term = clientSearch.trim().toLowerCase();
    return rows.filter((row) => {
      if (
        term &&
        searchable?.getText &&
        !searchable.getText(row).toLowerCase().includes(term)
      ) {
        return false;
      }
      for (const f of filters ?? []) {
        const value = clientFilterValues[f.id] ?? f.defaultValue ?? "all";
        if (value !== (f.defaultValue ?? "all") && f.test && !f.test(row, value)) {
          return false;
        }
      }
      return true;
    });
  }, [serverMode, rows, clientSearch, searchable, filters, clientFilterValues]);

  const sorted = useMemo(() => {
    if (serverMode || !clientSort) return filtered;
    const col = columns.find((c) => c.id === clientSort.columnId);
    if (!col?.sortValue) return filtered;
    const dir = clientSort.dir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const va = col.sortValue!(a);
      const vb = col.sortValue!(b);
      if (typeof va === "number" && typeof vb === "number")
        return (va - vb) * dir;
      return String(va).localeCompare(String(vb), "es") * dir;
    });
  }, [serverMode, filtered, clientSort, columns]);

  // --- Paginación (según modo) ---
  const totalPages = serverMode
    ? Math.max(1, Math.ceil(server!.total / server!.pageSize))
    : pageSize > 0
      ? Math.max(1, Math.ceil(sorted.length / pageSize))
      : 1;
  const currentPage = serverMode
    ? Math.min(server!.page, totalPages)
    : Math.min(clientPage, totalPages);

  // Filas a pintar: en server ya vienen paginadas; en cliente se cortan acá.
  const viewRows = serverMode
    ? rows
    : pageSize > 0
      ? sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize)
      : sorted;

  const goToPage = (n: number) => {
    if (serverMode) pushParams({ page: String(n) }, false);
    else setClientPage(n);
  };

  const hasActiveFilters = serverMode
    ? !!server!.q ||
      (filters ?? []).some(
        (f) =>
          (server!.filterValues[f.id] ?? "all") !== (f.defaultValue ?? "all"),
      )
    : !!clientSearch.trim() ||
      (filters ?? []).some(
        (f) =>
          (clientFilterValues[f.id] ?? "all") !== (f.defaultValue ?? "all"),
      );

  const clearFilters = () => {
    if (serverMode) {
      setSearchInput("");
      const cleared: Record<string, string | null> = { q: null, page: null };
      for (const f of filters ?? []) cleared[f.id] = null;
      pushParams(cleared);
      return;
    }
    setClientSearch("");
    setSearchInput("");
    setClientFilterValues(
      Object.fromEntries(
        (filters ?? []).map((f) => [f.id, f.defaultValue ?? "all"]),
      ),
    );
    setClientPage(1);
  };

  const shownCount = serverMode ? server!.total : sorted.length;
  const cardColumns = columns.filter((c) => !c.hideOnCard);
  const isEmpty = viewRows.length === 0;

  const emptyBlock = (
    <EmptyState
      icon={empty.icon}
      title={
        hasActiveFilters ? (empty.filteredTitle ?? empty.title) : empty.title
      }
      description={
        hasActiveFilters
          ? (empty.filteredDescription ?? empty.description)
          : empty.description
      }
      action={
        hasActiveFilters ? (
          <Button variant="outline" onClick={clearFilters}>
            Limpiar filtros
          </Button>
        ) : (
          empty.action
        )
      }
    />
  );

  return (
    <Card className="glass-card border-0 shadow-xl">
      {(title || searchable || filters?.length) && (
        <CardHeader className="space-y-4">
          {title && (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {Icon && (
                  <div className="w-8 h-8 bg-gradient-to-r from-brand to-brand-2 rounded-xl flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                )}
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                    {title}
                  </CardTitle>
                  {description && (
                    <CardDescription className="text-gray-600 dark:text-gray-300">
                      {description}
                    </CardDescription>
                  )}
                </div>
              </div>
              {actions}
            </div>
          )}

          {searchable && (
            <div className="relative">
              {serverMode && isPending ? (
                <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-brand" />
              ) : (
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              )}
              <Input
                aria-label={searchable.placeholder}
                placeholder={searchable.placeholder}
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 h-11 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-brand bg-card"
              />
            </div>
          )}

          {!!filters?.length && (
            <FilterGrid>
              {filters.map((f) => (
                <FilterSelect
                  key={f.id}
                  label={f.label}
                  icon={f.icon}
                  value={filterValueOf(f)}
                  onChange={(v) => onFilterChange(f, v)}
                  options={f.options}
                />
              ))}
            </FilterGrid>
          )}

          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
              <span className="font-semibold">{shownCount}</span>
              {serverMode ? " resultados" : ` de ${rows.length}`}
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-brand bg-brand/10 dark:bg-brand/20 px-3 py-1 rounded-full hover:bg-brand/20 transition-colors"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </CardHeader>
      )}

      <CardContent>
        {isEmpty ? (
          emptyBlock
        ) : (
          <>
            {/* Desktop: tabla */}
            <div
              className={cn(
                "hidden md:block rounded-xl border-2 border-gray-100 dark:border-gray-700 overflow-hidden transition-opacity",
                serverMode && isPending && "opacity-60",
              )}
            >
              <Table>
                <TableHeader className="bg-gray-50 dark:bg-gray-800">
                  <TableRow className="hover:bg-transparent">
                    {columns.map((col) => {
                      const isSorted = activeSort?.columnId === col.id;
                      return (
                        <TableHead
                          key={col.id}
                          aria-sort={
                            isSorted
                              ? activeSort!.dir === "asc"
                                ? "ascending"
                                : "descending"
                              : undefined
                          }
                          className={cn(
                            "font-semibold text-gray-900 dark:text-white",
                            col.align && ALIGN[col.align],
                            col.hideBelow && HIDE_BELOW[col.hideBelow],
                          )}
                        >
                          {col.sortValue ? (
                            <button
                              type="button"
                              onClick={() => toggleSort(col)}
                              className={cn(
                                "inline-flex items-center gap-1.5 hover:text-brand transition-colors",
                                col.align === "right" && "flex-row-reverse",
                              )}
                            >
                              {col.header}
                              {isSorted ? (
                                activeSort!.dir === "asc" ? (
                                  <ArrowUp className="w-3.5 h-3.5 text-brand" />
                                ) : (
                                  <ArrowDown className="w-3.5 h-3.5 text-brand" />
                                )
                              ) : (
                                <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />
                              )}
                            </button>
                          ) : (
                            col.header
                          )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {viewRows.map((row) => (
                    <TableRow
                      key={getRowKey(row)}
                      className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      {columns.map((col) => (
                        <TableCell
                          key={col.id}
                          className={cn(
                            col.align && ALIGN[col.align],
                            col.hideBelow && HIDE_BELOW[col.hideBelow],
                          )}
                        >
                          {col.cell(row)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile: cards (una tabla de N columnas es ilegible en 375px) */}
            <div
              className={cn(
                "md:hidden space-y-3 transition-opacity",
                serverMode && isPending && "opacity-60",
              )}
            >
              {viewRows.map((row) => (
                <div key={getRowKey(row)}>
                  {renderCard ? (
                    renderCard(row)
                  ) : (
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-card p-4 space-y-3">
                      {/* La primera columna hace de título de la card */}
                      <div>{cardColumns[0]?.cell(row)}</div>
                      <dl className="grid grid-cols-2 gap-2 text-sm">
                        {cardColumns.slice(1).map((col) => (
                          <div key={col.id} className="min-w-0">
                            <dt className="text-xs text-gray-500 dark:text-gray-400">
                              {col.cardLabel ??
                                (typeof col.header === "string"
                                  ? col.header
                                  : col.id)}
                            </dt>
                            <dd className="text-gray-900 dark:text-white truncate">
                              {col.cell(row)}
                            </dd>
                          </div>
                        ))}
                      </dl>
                      {rowActions && (
                        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                          {rowActions(row)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Página {currentPage} de {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    disabled={currentPage === 1}
                    onClick={() => goToPage(currentPage - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    disabled={currentPage === totalPages}
                    onClick={() => goToPage(currentPage + 1)}
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
