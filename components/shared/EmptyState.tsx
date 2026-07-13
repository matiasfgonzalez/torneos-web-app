import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Estado vacío estándar (F0) — patrón §7 de docs/UI_PATTERNS.md.
 * Sirve para "sin resultados de búsqueda" (action = limpiar filtros) y
 * "sin datos todavía" (action = botón creador). Adaptá el copy a cada caso.
 */
export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  /** Botón/CTA opcional (usar <Button variant="brand"> para acción creadora) */
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("text-center py-20", className)}>
      <div className="w-24 h-24 bg-gradient-to-br from-brand/10 to-brand-2/10 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
        <Icon className="h-12 w-12 text-gray-400" aria-hidden="true" />
      </div>
      <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
