/**
 * Parser de `searchParams` para las tablas del panel (M7).
 *
 * El estado de una tabla server-side (página, búsqueda, filtros, orden) vive en
 * la URL: así es **compartible** (mandás el link con los filtros puestos) y lo
 * lee el server component para armar la query de Prisma. Este helper centraliza
 * el parseo/saneo para que cada tabla no lo reimplemente.
 *
 * Convención de nombres de query param (los mismos que empuja `<DataTable>` en
 * modo server): `page`, `q`, `sort`, `dir`, y cada filtro por su `id`.
 */

/** searchParams tal como llegan a un page del App Router (post-Next 15: promesa). */
export type RawSearchParams = Record<string, string | string[] | undefined>;

export interface ParsedTableParams {
  /** Página 1-based ya saneada (mínimo 1). */
  page: number;
  pageSize: number;
  /** `skip`/`take` listos para Prisma. */
  skip: number;
  take: number;
  /** Texto de búsqueda, trim. Vacío = sin búsqueda. */
  q: string;
  /** Columna de orden (id) o null. */
  sort: string | null;
  dir: "asc" | "desc";
  /** Filtros activos (los que no están en su valor "all"/default). */
  filters: Record<string, string>;
}

export interface ParseTableOpts {
  pageSize?: number;
  /** Ids de filtro a leer de la URL (ej. ["status", "role"]). */
  filterKeys?: string[];
  defaultSort?: string;
  defaultDir?: "asc" | "desc";
}

const first = (v: string | string[] | undefined): string =>
  (Array.isArray(v) ? v[0] : v) ?? "";

/** Lee y sanea los params de tabla desde los `searchParams` del page. */
export function parseTableParams(
  sp: RawSearchParams,
  opts: ParseTableOpts = {},
): ParsedTableParams {
  const pageSize = opts.pageSize ?? 10;

  const pageRaw = parseInt(first(sp.page), 10);
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;

  const q = first(sp.q).trim();

  const sortRaw = first(sp.sort);
  const sort = sortRaw || opts.defaultSort || null;

  const dirRaw = first(sp.dir);
  const dir: "asc" | "desc" =
    dirRaw === "asc" || dirRaw === "desc" ? dirRaw : (opts.defaultDir ?? "desc");

  const filters: Record<string, string> = {};
  for (const key of opts.filterKeys ?? []) {
    const value = first(sp[key]);
    // "all" (o vacío) = sin filtrar; no se propaga a la query.
    if (value && value !== "all") filters[key] = value;
  }

  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    take: pageSize,
    q,
    sort,
    dir,
    filters,
  };
}

export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Meta de paginación a partir del total real de la query. Clampea la página al
 * rango válido (si borrás filas y la página actual dejó de existir, cae a la
 * última) para que la UI no muestre una página vacía.
 */
export function paginationMeta(
  total: number,
  page: number,
  pageSize: number,
): PaginationMeta {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return { total, page: Math.min(page, totalPages), pageSize, totalPages };
}
