"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, type LucideIcon } from "lucide-react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/**
 * Filtro de una sola opción: disparador compacto + lista desplegable
 * (patrón §6 de docs/UI_PATTERNS.md).
 *
 * **Por qué dejó de ser una fila de chips (2026-07-22).** F2 los puso como
 * chips pensando en pocas opciones, y con pocas funcionaba. Pero `/torneos`
 * terminó con 14 categorías + 9 estados: veintipico de píldoras siempre
 * visibles que en el celular se comen la pantalla antes de que aparezca un solo
 * torneo, y que en una fila con scroll horizontal **esconden** las opciones sin
 * que se note que hay más.
 *
 * El disparador ocupa una línea, **dice cuál es el filtro activo sin abrirlo**
 * (que es lo que el usuario necesita saber de un vistazo) y las opciones se ven
 * recién cuando se las pide. Con muchas opciones aparece un buscador: en una
 * lista de 14 categorías, tipear "vet" es más rápido que barrer con el ojo.
 */

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterSelectProps {
  /** Etiqueta del filtro (ej. "Estado"). Se anuncia al lector de pantalla. */
  label: string;
  icon?: LucideIcon;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  /**
   * Valor "sin filtrar" (ej. "Todas"). Por defecto, la primera opción — que es
   * la convención en todos los listados. Se usa solo para resaltar el
   * disparador cuando hay un filtro puesto.
   */
  neutralValue?: string;
  /** A partir de cuántas opciones se muestra el buscador. */
  searchThreshold?: number;
  className?: string;
}

export function FilterSelect({
  label,
  icon: Icon,
  options,
  value,
  onChange,
  neutralValue,
  searchThreshold = 8,
  className,
}: Readonly<FilterSelectProps>) {
  const [open, setOpen] = useState(false);

  if (options.length === 0) return null;

  const neutral = neutralValue ?? options[0]?.value;
  const selected = options.find((o) => o.value === value);
  const isFiltering = value !== neutral;
  const showSearch = options.length > searchThreshold;
  const labelId = `filtro-${label.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div className={cn("space-y-1.5", className)}>
      <span
        id={labelId}
        className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
      >
        {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
        {label}
      </span>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            // Sin `role="combobox"` a propósito: ese rol exige `aria-controls`
            // apuntando al listbox, y acá el panel es un diálogo de Radix.
            // `PopoverTrigger` ya pone `aria-haspopup`, `aria-expanded` y
            // `aria-controls` correctos; declararlo a mano los contradecía.
            aria-labelledby={labelId}
            className={cn(
              // 44px de alto: objetivo táctil mínimo (AGENT_RULES).
              "flex h-11 w-full items-center justify-between gap-2 rounded-xl border-2 px-3.5 text-sm font-medium transition-colors duration-150 ease-brand",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
              isFiltering
                ? "border-brand bg-brand/5 text-brand dark:bg-brand/10"
                : "border-gray-200 bg-card text-gray-700 hover:border-brand/50 dark:border-gray-700 dark:text-gray-300",
            )}
          >
            <span className="truncate">{selected?.label ?? "Todas"}</span>
            <ChevronsUpDown
              className="h-4 w-4 shrink-0 opacity-60"
              aria-hidden="true"
            />
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          // Del ancho del disparador: en mobile el panel no se sale de la
          // pantalla ni queda flotando desalineado.
          className="w-(--radix-popover-trigger-width) p-0"
        >
          <Command>
            {showSearch && (
              <CommandInput placeholder={`Buscar ${label.toLowerCase()}…`} />
            )}
            <CommandList className="max-h-64">
              <CommandEmpty>Sin resultados.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => {
                  const active = option.value === value;
                  return (
                    <CommandItem
                      key={option.value}
                      value={option.label}
                      onSelect={() => {
                        onChange(option.value);
                        setOpen(false);
                      }}
                      className="h-10 cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "h-4 w-4 text-brand",
                          active ? "opacity-100" : "opacity-0",
                        )}
                        aria-hidden="true"
                      />
                      <span className="truncate">{option.label}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

/**
 * Contenedor de filtros: apilados en mobile, en columnas cuando hay lugar. Que
 * todos los listados lo usen evita que cada pantalla invente su propia grilla.
 */
export function FilterGrid({
  children,
  className,
}: Readonly<{ children: React.ReactNode; className?: string }>) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {children}
    </div>
  );
}
