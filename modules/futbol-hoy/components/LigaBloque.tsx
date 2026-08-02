import { Trophy } from "lucide-react";

import { SmartImage } from "@/components/shared/SmartImage";
import type { GrupoLiga } from "@/lib/futbol-hoy/types";

import { PartidoMundialCard } from "./PartidoMundialCard";

/**
 * Un bloque de la página: el encabezado de la liga (escudo, nombre, país) y sus
 * partidos del día. El orden de los bloques y de los partidos lo decide
 * `agruparPorLiga` — acá solo se dibuja.
 */
export function LigaBloque({ liga }: Readonly<{ liga: GrupoLiga }>) {
  return (
    <section
      className="overflow-hidden rounded-2xl border border-white/50 bg-white/80 shadow-lg backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-800/80"
      aria-labelledby={`liga-${liga.leagueId}`}
    >
      <header className="flex items-center gap-3 border-b border-gray-100 bg-gradient-to-r from-brand/5 to-brand-2/5 px-4 py-3 dark:border-gray-800">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-brand/20 bg-white dark:bg-gray-900">
          {liga.leagueLogo ? (
            <SmartImage
              src={liga.leagueLogo}
              alt=""
              width={36}
              height={36}
              className="h-8 w-8 object-contain"
            />
          ) : (
            <Trophy className="h-5 w-5 text-brand" aria-hidden="true" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h2
            id={`liga-${liga.leagueId}`}
            className="truncate font-bold text-gray-900 dark:text-white"
          >
            {liga.leagueName}
          </h2>
          {liga.leagueCountry && (
            <p className="flex items-center gap-1.5 truncate text-xs text-gray-600 dark:text-gray-400">
              {liga.leagueFlag && (
                <SmartImage
                  src={liga.leagueFlag}
                  alt=""
                  width={16}
                  height={12}
                  className="h-3 w-4 shrink-0 object-contain"
                />
              )}
              {liga.leagueCountry}
            </p>
          )}
        </div>

        {liga.enVivo > 0 && (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-green-600 px-2.5 py-1 text-xs font-bold text-white">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-75 motion-safe:animate-ping" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
            </span>
            {liga.enVivo} en vivo
          </span>
        )}

        <span className="shrink-0 text-xs font-medium text-gray-500 dark:text-gray-400">
          {liga.partidos.length}
          <span className="sr-only"> partidos</span>
        </span>
      </header>

      <div className="space-y-2 p-3 sm:p-4">
        {liga.partidos.map((partido) => (
          <PartidoMundialCard key={partido.fixtureId} partido={partido} />
        ))}
      </div>
    </section>
  );
}
