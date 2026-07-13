import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Skeletons estándar (F0) que preservan el layout mientras cargan datos —
 * preferibles a spinners cuando se conoce la forma final del contenido
 * (ver docs/COMPONENT_LIBRARY.md §5).
 */

/** Tabla en carga: header + N filas. */
export function SkeletonTable({
  rows = 5,
  columns = 4,
  className,
}: {
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden",
        className,
      )}
      aria-busy="true"
      aria-label="Cargando tabla"
    >
      <div className="bg-gray-50 dark:bg-gray-900/50 px-4 py-3 flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="px-4 py-4 flex gap-4 items-center">
            {Array.from({ length: columns }).map((_, c) => (
              <Skeleton
                key={c}
                className={cn("h-4 flex-1", c === 0 && "h-8 max-w-40")}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Grid de cards en carga (listados públicos/admin). */
export function SkeletonCards({
  count = 6,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
      aria-busy="true"
      aria-label="Cargando contenido"
    >
      {Array.from({ length: count }).map((_, i) => (
        <Card
          key={i}
          className="border border-gray-100 dark:border-gray-800 overflow-hidden"
        >
          <Skeleton className="h-36 w-full rounded-none" />
          <CardContent className="p-6 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
