"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * Estado de filtros sincronizado con la URL (F2) — los listados públicos
 * pasan a ser compartibles/bookmarkeables y el botón "atrás" del navegador
 * deshace un filtro en vez de salir de la página.
 *
 * Convención: un filtro en su valor por defecto NO aparece en la query
 * (`/torneos` en vez de `/torneos?estado=Todos&...`).
 *
 * Uso:
 *   const { values, setFilter, clearFilters, hasActiveFilters } =
 *     useUrlFilters({ q: "", estado: "Todos" });
 */
export function useUrlFilters<T extends Record<string, string>>(defaults: T) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const values = useMemo(() => {
    const next = { ...defaults };
    for (const key of Object.keys(defaults) as (keyof T & string)[]) {
      const fromUrl = searchParams.get(key);
      if (fromUrl !== null) next[key] = fromUrl as T[keyof T & string];
    }
    return next;
    // `defaults` se re-crea en cada render del consumidor; sus claves y valores
    // son literales estables, así que basta con seguir la query.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const write = useCallback(
    (next: T) => {
      const params = new URLSearchParams();
      for (const key of Object.keys(next) as (keyof T & string)[]) {
        // El valor por defecto no ensucia la URL
        if (next[key] !== defaults[key]) params.set(key, next[key]);
      }
      const qs = params.toString();
      // `scroll: false`: cambiar un filtro no debe saltar al tope de la página
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pathname, router],
  );

  const setFilter = useCallback(
    <K extends keyof T & string>(key: K, value: T[K]) => {
      write({ ...values, [key]: value });
    },
    [values, write],
  );

  const clearFilters = useCallback(() => {
    write({ ...defaults });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [write]);

  const hasActiveFilters = useMemo(
    () =>
      (Object.keys(defaults) as (keyof T & string)[]).some(
        (key) => values[key] !== defaults[key],
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [values],
  );

  return { values, setFilter, clearFilters, hasActiveFilters };
}
