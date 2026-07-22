"use client";

import { useState, useTransition } from "react";
import { Building2, Search, Shield, UserRoundCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  searchTeamsAcrossLeagues,
  type SharedTeam,
} from "@modules/equipos/actions/searchTeams";

/**
 * Buscar un club en **otras ligas** para inscribirlo en el torneo propio.
 *
 * El mismo club juega en varias ligas, y hasta ahora el organizador solo veía
 * los equipos de la suya: si no encontraba al club, lo volvía a crear. La
 * restricción provocaba justo la duplicación que parecía evitar.
 *
 * Elegir un equipo de acá **no lo copia ni lo transfiere**: lo sigue
 * administrando su liga dueña. Solo se crea la inscripción al torneo.
 */
export default function SharedTeamPicker({
  usedTeamIds,
  onPick,
}: Readonly<{
  usedTeamIds: string[];
  onPick: (team: SharedTeam) => void;
}>) {
  const [abierto, setAbierto] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SharedTeam[] | null>(null);
  const [isSearching, startSearch] = useTransition();

  const buscar = () =>
    startSearch(async () => {
      setResults(await searchTeamsAcrossLeagues(query));
    });

  if (!abierto) {
    return (
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="text-left text-sm font-medium text-brand hover:underline"
      >
        ¿No está en la lista? Buscar en otras ligas
      </button>
    );
  }

  const yaInscriptos = new Set(usedTeamIds);

  return (
    <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900/50">
      <div className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nombre del club (mínimo 2 letras)"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              // El picker vive dentro de un form: sin esto, Enter lo enviaría.
              e.preventDefault();
              buscar();
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          onClick={buscar}
          disabled={isSearching || query.trim().length < 2}
        >
          <Search className="h-4 w-4" aria-hidden="true" />
          Buscar
        </Button>
      </div>

      {results !== null && results.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Ningún club coincide. Si no existe todavía, cerrá esto y crealo desde
          Equipos.
        </p>
      )}

      {results !== null && results.length > 0 && (
        <ul className="space-y-2">
          {results.map((t) => {
            const yaEsta = yaInscriptos.has(t.id);
            return (
              <li
                key={t.id}
                className="flex items-center gap-3 rounded-lg border border-gray-200 bg-card p-2.5 dark:border-gray-700"
              >
                <Shield
                  className="h-5 w-5 shrink-0 text-brand"
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                    {t.name}
                    {t.homeCity ? ` · ${t.homeCity}` : ""}
                  </p>
                  <p className="flex flex-wrap items-center gap-x-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="inline-flex items-center gap-1">
                      <Building2 className="h-3 w-3" aria-hidden="true" />
                      {t.organizationName}
                      {t.isOwn ? " (tu liga)" : ""}
                    </span>
                    {t.hasDelegate && (
                      <span className="inline-flex items-center gap-1 text-brand">
                        <UserRoundCheck className="h-3 w-3" aria-hidden="true" />
                        tiene delegado
                      </span>
                    )}
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant={yaEsta ? "ghost" : "outline"}
                  disabled={yaEsta}
                  onClick={() => onPick(t)}
                >
                  {yaEsta ? "Ya inscripto" : "Elegir"}
                </Button>
              </li>
            );
          })}
        </ul>
      )}

      <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
        Elegir un club de otra liga lo inscribe en tu torneo, pero no te da
        permiso para editar sus datos: eso lo sigue haciendo la liga que lo
        cargó y su delegado.
      </p>
    </div>
  );
}
