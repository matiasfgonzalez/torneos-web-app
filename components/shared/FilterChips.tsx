"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Filtros como chips horizontales (F2, patrón app deportiva): en mobile
 * scrollean en una sola fila (sin cortar opciones ni apilar selects), en
 * desktop hacen wrap. Reemplaza a los `<Select>`/`<select>` de los listados
 * públicos — ver docs/UI_PATTERNS.md §6.
 *
 * El estado vive en la URL vía `useUrlFilters` (hooks/use-url-filters.ts).
 */

export interface ChipOption {
  value: string;
  label: string;
}

export interface FilterChipGroupProps {
  /** Etiqueta del grupo (ej. "Estado"). Se anuncia al lector de pantalla. */
  label: string;
  icon?: LucideIcon;
  options: ChipOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function FilterChipGroup({
  label,
  icon: Icon,
  options,
  value,
  onChange,
  className,
}: Readonly<FilterChipGroupProps>) {
  if (options.length === 0) return null;

  return (
    <div className={cn("space-y-2", className)}>
      <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {Icon && <Icon className="w-3.5 h-3.5" aria-hidden="true" />}
        {label}
      </span>

      {/* Mobile: una fila que scrollea. Desktop: wrap. */}
      <div
        role="group"
        aria-label={label}
        className="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-1 sm:flex-wrap sm:overflow-visible sm:mx-0 sm:px-0"
      >
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              aria-pressed={selected}
              className={cn(
                // 44px de alto: objetivo táctil mínimo (AGENT_RULES)
                "shrink-0 h-11 px-4 rounded-full border-2 text-sm font-medium whitespace-nowrap transition-all",
                selected
                  ? "bg-gradient-to-r from-brand to-brand-2 border-transparent text-white shadow-lg shadow-brand/25"
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-brand/50 hover:text-brand",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
