import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

/**
 * Breadcrumbs del panel (F3, 2026-07-14).
 *
 * Vivía dentro de `PageHeader`, pero las pantallas de detalle (torneo, equipo,
 * noticia, usuario) tienen su propio header y no pueden usar `PageHeader`: sin
 * extraerlo, cada una habría copiado el markup. `PageHeader` sigue aceptando su
 * prop `breadcrumbs` y renderiza esto por dentro.
 *
 * Reemplaza al botón "Volver a X" que tenían las subpáginas: el breadcrumb dice
 * dónde estás además de a dónde volvés, y el link de la sección hace lo mismo
 * que hacía el botón.
 *
 * El primer nivel ("Panel") lo agrega el componente — no lo repitas en `items`.
 */
export interface Breadcrumb {
  label: string;
  /** Sin `href` = nivel actual (no es link). El último ítem nunca lleva href. */
  href?: string;
}

export function Breadcrumbs({
  items,
  className,
}: Readonly<{ items: Breadcrumb[]; className?: string }>) {
  return (
    <nav
      aria-label="Ruta de navegación"
      className={className ?? "mb-4 flex items-center gap-2 text-sm"}
    >
      <ol className="flex flex-wrap items-center gap-2">
        <li className="flex items-center gap-2">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-1.5 text-gray-500 transition-colors hover:text-brand dark:text-gray-400"
          >
            <Home className="h-3.5 w-3.5" aria-hidden="true" />
            Panel
          </Link>
        </li>

        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-2">
              <ChevronRight
                className="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-600"
                aria-hidden="true"
              />
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="text-gray-500 transition-colors hover:text-brand dark:text-gray-400"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className="max-w-[200px] truncate font-medium text-gray-900 sm:max-w-xs dark:text-white"
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
