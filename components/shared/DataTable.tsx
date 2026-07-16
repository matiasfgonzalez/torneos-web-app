"use client";

import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
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
import { FilterChipGroup, type ChipOption } from "@/components/shared/FilterChips";
import { cn } from "@/lib/utils";

/**
 * Tabla común del panel (F3) — patrón §4b de docs/UI_PATTERNS.md.
 *
 * Resuelve de una vez lo que cada tabla del admin reimplementaba a mano:
 * búsqueda, filtros, **orden por columna**, **paginación** y **colapso a
 * cards en mobile** (una tabla de 7 columnas es ilegible en 375px).
 *
 * Ordenar/filtrar/paginar es **en cliente**: alcanza para los volúmenes
 * actuales. La paginación server-side es M7 y se enchufa acá cuando llegue
 * (misma API de columnas, cambia de dónde salen las filas).
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
  options: ChipOption[];
  /** `value` es el `ChipOption.value` elegido; se llama solo si no es el default. */
  test: (row: T, value: string) => boolean;
  /** Valor "sin filtrar". Default: "all". */
  defaultValue?: string;
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
  searchable?: { placeholder: string; getText: (row: T) => string };
  filters?: DataTableFilter<T>[];

  /** 0 = sin paginación. Default: 10. */
  pageSize?: number;

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

const HIDE_BELOW: Record<NonNullable<DataTableColumn<unknown>["hideBelow"]>, string> =
  {
    lg: "hidden lg:table-cell",
    xl: "hidden xl:table-cell",
  };

const ALIGN: Record<NonNullable<DataTableColumn<unknown>["align"]>, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

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
  empty,
  renderCard,
  rowActions,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      (filters ?? []).map((f) => [f.id, f.defaultValue ?? "all"]),
    ),
  );
  const [sort, setSort] = useState<SortState>(null);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (term && searchable && !searchable.getText(row).toLowerCase().includes(term)) {
        return false;
      }
      for (const f of filters ?? []) {
        const value = filterValues[f.id] ?? f.defaultValue ?? "all";
        if (value !== (f.defaultValue ?? "all") && !f.test(row, value)) {
          return false;
        }
      }
      return true;
    });
  }, [rows, search, searchable, filters, filterValues]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const col = columns.find((c) => c.id === sort.columnId);
    if (!col?.sortValue) return filtered;
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const va = col.sortValue!(a);
      const vb = col.sortValue!(b);
      if (typeof va === "number" && typeof vb === "number") return (va - vb) * dir;
      return String(va).localeCompare(String(vb), "es") * dir;
    });
  }, [filtered, sort, columns]);

  const totalPages = pageSize > 0 ? Math.max(1, Math.ceil(sorted.length / pageSize)) : 1;
  // Ajuste durante el render (no useEffect): si al filtrar la página actual
  // dejó de existir, volver a la 1 sin disparar un render en cascada.
  const currentPage = Math.min(page, totalPages);
  const paged =
    pageSize > 0
      ? sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize)
      : sorted;

  const hasActiveFilters =
    !!search.trim() ||
    (filters ?? []).some(
      (f) => (filterValues[f.id] ?? "all") !== (f.defaultValue ?? "all"),
    );

  const toggleSort = (col: DataTableColumn<T>) => {
    if (!col.sortValue) return;
    setPage(1);
    setSort((prev) => {
      if (prev?.columnId !== col.id) return { columnId: col.id, dir: "asc" };
      if (prev.dir === "asc") return { columnId: col.id, dir: "desc" };
      return null; // tercer click: sin orden
    });
  };

  const clearFilters = () => {
    setSearch("");
    setFilterValues(
      Object.fromEntries(
        (filters ?? []).map((f) => [f.id, f.defaultValue ?? "all"]),
      ),
    );
    setPage(1);
  };

  const cardColumns = columns.filter((c) => !c.hideOnCard);

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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={searchable.placeholder}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-10 h-11 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-brand bg-card"
              />
            </div>
          )}

          {filters?.map((f) => (
            <FilterChipGroup
              key={f.id}
              label={f.label}
              icon={f.icon}
              value={filterValues[f.id] ?? f.defaultValue ?? "all"}
              onChange={(v) => {
                setFilterValues((prev) => ({ ...prev, [f.id]: v }));
                setPage(1);
              }}
              options={f.options}
            />
          ))}

          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
              <span className="font-semibold">{sorted.length}</span> de{" "}
              {rows.length}
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
        {sorted.length === 0 ? (
          emptyBlock
        ) : (
          <>
            {/* Desktop: tabla */}
            <div className="hidden md:block rounded-xl border-2 border-gray-100 dark:border-gray-700 overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50 dark:bg-gray-800">
                  <TableRow className="hover:bg-transparent">
                    {columns.map((col) => {
                      const isSorted = sort?.columnId === col.id;
                      return (
                        <TableHead
                          key={col.id}
                          aria-sort={
                            isSorted
                              ? sort.dir === "asc"
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
                                sort.dir === "asc" ? (
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
                  {paged.map((row) => (
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
            <div className="md:hidden space-y-3">
              {paged.map((row) => (
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
            {pageSize > 0 && totalPages > 1 && (
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
                    onClick={() => setPage(currentPage - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    disabled={currentPage === totalPages}
                    onClick={() => setPage(currentPage + 1)}
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
