"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarPlus,
  Home,
  Loader2,
  Shield,
  Trophy,
  UserCheck,
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { navItemsForRole } from "@/lib/constants/admin-nav";
import type { AdminSearchResult } from "@/app/api/admin/search/route";

/**
 * Command palette del panel (F3) — Ctrl/⌘+K.
 *
 * Dos cosas, en este orden:
 * 1. **Ir a un recurso**: busca torneos, equipos y jugadores por nombre contra
 *    `GET /api/admin/search` (acotado a las organizaciones del usuario). Es el
 *    valor real del atajo: llegar al torneo "Clausura 2026" sin pasar por el
 *    listado y filtrar.
 * 2. **Ir a una sección**: los mismos ítems que el sidebar, de la fuente única
 *    `lib/constants/admin-nav.ts`.
 *
 * El filtrado propio de cmdk se desactiva (`shouldFilter={false}`) para los
 * resultados del server: ya vienen filtrados por la query, y volver a filtrarlos
 * en el cliente con otro criterio escondía coincidencias válidas.
 */

const MIN_QUERY = 2;
const DEBOUNCE_MS = 250;

const RESULT_META: Record<
  AdminSearchResult["type"],
  { icon: typeof Trophy; href: (id: string) => string; group: string }
> = {
  tournament: {
    icon: Trophy,
    href: (id) => `/admin/torneos/${id}`,
    group: "Torneos",
  },
  team: {
    icon: Shield,
    href: (id) => `/admin/equipos/${id}`,
    group: "Equipos",
  },
  // El jugador no tiene detalle en el panel (`/admin/jugadores` es solo la
  // tabla): su única ficha es la pública. Llevar al listado sería un atajo que
  // no acorta nada, así que el grupo avisa a dónde va.
  player: {
    icon: UserCheck,
    href: (id) => `/jugadores/${id}`,
    group: "Jugadores (ficha pública)",
  },
};

interface CommandPaletteProps {
  role: string | null;
  /** Rol en la organización (OWNER/ORGANIZADOR/COLABORADOR/null) — N14c. */
  orgRole?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({
  role,
  orgRole,
  open,
  onOpenChange,
}: Readonly<CommandPaletteProps>) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  // Se guarda junto al término que los produjo: así, al seguir escribiendo, se
  // sabe que lo que hay en pantalla todavía es de la búsqueda anterior.
  const [results, setResults] = useState<{
    term: string;
    data: AdminSearchResult[];
  }>({ term: "", data: [] });
  const [isSearching, startSearch] = useTransition();

  const sections = navItemsForRole(role, orgRole).filter(
    (item) => item.enabled,
  );

  // Buscar en cada tecla sería una query por letra: se debouncea. El fetch va
  // dentro de una transición y el effect NO hace setState en su cuerpo — con
  // una query corta simplemente no busca, y el "sin resultados" se deriva al
  // renderizar (react-hooks/set-state-in-effect, ver docs/AGENT_RULES.md).
  useEffect(() => {
    const term = query.trim();
    if (term.length < MIN_QUERY) return;

    const controller = new AbortController();
    const timer = setTimeout(() => {
      startSearch(async () => {
        try {
          const res = await fetch(
            `/api/admin/search?q=${encodeURIComponent(term)}`,
            { signal: controller.signal },
          );
          if (!res.ok) throw new Error();
          const data: AdminSearchResult[] = await res.json();
          setResults({ term, data });
        } catch {
          // Abortar al seguir tecleando no es un error que mostrarle a nadie
          if (!controller.signal.aborted) setResults({ term, data: [] });
        }
      });
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const go = useCallback(
    (href: string) => {
      onOpenChange(false);
      setQuery("");
      router.push(href);
    },
    [onOpenChange, router],
  );

  const term = query.trim();
  const showResults = term.length >= MIN_QUERY;
  // Derivado, no guardado: con una query corta no hay resultados que mostrar,
  // y los de una búsqueda anterior no se pintan como si fueran de esta.
  const visibleResults = showResults && results.term === term ? results.data : [];
  const loading = isSearching || (showResults && results.term !== term);

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      shouldFilter={!showResults}
      title="Buscador del panel"
      description="Buscá un torneo, equipo o jugador, o saltá a una sección"
      className="sm:max-w-xl"
    >
      <CommandInput
        placeholder="Buscar un torneo, equipo, jugador o sección…"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList className="max-h-[60vh]">
        <CommandEmpty>
          {loading ? (
            <span className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Buscando…
            </span>
          ) : showResults ? (
            "Sin resultados. Probá con otro nombre."
          ) : (
            "Escribí para buscar."
          )}
        </CommandEmpty>

        {showResults &&
          (["tournament", "team", "player"] as const).map((type) => {
            const group = visibleResults.filter((r) => r.type === type);
            if (!group.length) return null;
            const { icon: Icon, href, group: heading } = RESULT_META[type];

            return (
              <CommandGroup key={type} heading={heading}>
                {group.map((result) => (
                  <CommandItem
                    key={`${type}-${result.id}`}
                    value={`${type}-${result.id}`}
                    onSelect={() => go(href(result.id))}
                  >
                    <Icon aria-hidden="true" />
                    <span className="truncate">{result.title}</span>
                    {result.subtitle && (
                      <span className="ml-auto truncate text-xs text-muted-foreground">
                        {result.subtitle}
                      </span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            );
          })}

        {visibleResults.length > 0 && <CommandSeparator />}

        <CommandGroup heading="Ir a">
          {sections.map((item) => (
            <CommandItem
              key={item.href}
              value={`${item.title} ${item.keywords?.join(" ") ?? ""}`}
              onSelect={() => go(item.href)}
            >
              <item.icon aria-hidden="true" />
              {item.title}
            </CommandItem>
          ))}
        </CommandGroup>

        {!showResults && (
          <CommandGroup heading="Acciones">
            <CommandItem
              value="cargar resultado partido marcador goles"
              onSelect={() => go("/admin/partidos")}
            >
              <CalendarPlus aria-hidden="true" />
              Cargar el resultado de un partido
            </CommandItem>
            <CommandItem value="ver sitio publico inicio" onSelect={() => go("/")}>
              <Home aria-hidden="true" />
              Volver al sitio
            </CommandItem>
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}

/**
 * Atajo Ctrl/⌘+K. Vive acá (y no en `AdminShell`) para que el listener y el
 * estado del palette viajen juntos: quien lo monte solo pasa el rol.
 */
export function useCommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return { open, setOpen };
}

export { CommandShortcut };
