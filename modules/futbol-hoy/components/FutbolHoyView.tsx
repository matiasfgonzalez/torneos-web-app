"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { CalendarDays, Info, RefreshCw, Search, Trophy, X } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLivePoll } from "@/hooks/use-live-poll";
import { api } from "@/lib/api-client";
import { formatDate } from "@/lib/formatDate";
import { estaEnVivo } from "@/lib/futbol-hoy/estado";
import { correrDia } from "@/lib/futbol-hoy/fecha";
import type { GrupoLiga, RespuestaFutbolHoy } from "@/lib/futbol-hoy/types";
import { useUrlFilters } from "@/hooks/use-url-filters";

import { LigaBloque } from "./LigaBloque";

/**
 * Vista de "Fútbol de hoy": el listado de partidos del mundo agrupado por liga,
 * con búsqueda, filtro de en vivo y navegación por fecha.
 *
 * **El polling le pega a NUESTRA API, no a API-Football.** Refrescar cada
 * minuto contra el proveedor agotaría el plan gratuito en hora y media; contra
 * nuestra base es gratis, y quien decide si hay que salir a buscar datos nuevos
 * es la política de `lib/futbol-hoy/politica.ts` (20 minutos), del lado del
 * server. Por eso el usuario ve el marcador actualizarse solo sin que eso
 * signifique una llamada al tercero.
 */

/** Con partidos en curso el marcador cambia; sin ellos, casi nada se mueve. */
const POLL_EN_VIVO_MS = 60_000;
const POLL_TRANQUILO_MS = 5 * 60_000;

const DEFAULTS = { date: "", q: "", envivo: "" };

export function FutbolHoyView({
  inicial,
}: Readonly<{ inicial: RespuestaFutbolHoy }>) {
  const { values, setFilter, clearFilters, hasActiveFilters } =
    useUrlFilters(DEFAULTS);

  const [datos, setDatos] = useState<RespuestaFutbolHoy>(inicial);

  // El server ya entregó los datos del primer render: el tick inmediato de
  // `useLivePoll` volvería a pedir lo mismo al instante, una consulta por visita
  // para nada. Se saltea SOLO esa primera vez; los ticks siguientes y el
  // refresco al volver a la pestaña se hacen igual.
  const primerTick = useRef(true);

  const refrescar = useCallback(async () => {
    if (primerTick.current) {
      primerTick.current = false;
      return;
    }
    const res = await api.get<RespuestaFutbolHoy>(
      `/api/world-fixtures?date=${inicial.matchDay}`,
      { cache: "no-store" },
    );
    // Sin conexión el cliente devuelve ok:false y se reintenta en el próximo
    // tick: la pantalla se queda con lo último bueno en vez de vaciarse.
    if (res.ok) setDatos(res.data);
  }, [inicial.matchDay]);

  const hayEnVivo = datos.totales.enVivo > 0;
  useLivePoll(refrescar, hayEnVivo ? POLL_EN_VIVO_MS : POLL_TRANQUILO_MS, true);

  const soloEnVivo = values.envivo === "1";
  const termino = values.q.trim().toLowerCase();

  // Los filtros filtran de verdad: el buscador mira liga, país y los dos
  // equipos, y "solo en vivo" descarta partidos, no solo los pinta distinto.
  const ligasVisibles = useMemo(
    () => filtrarLigas(datos.ligas, termino, soloEnVivo),
    [datos.ligas, termino, soloEnVivo],
  );

  const visibles = ligasVisibles.reduce((n, l) => n + l.partidos.length, 0);
  const esHoy = datos.matchDay === datos.hoy;

  return (
    <div className="space-y-6">
      {/* Navegación por fecha */}
      <nav
        className="flex flex-wrap items-center justify-center gap-2"
        aria-label="Elegir fecha"
      >
        <BotonFecha
          etiqueta="Ayer"
          dia={correrDia(datos.hoy, -1)}
          actual={datos.matchDay}
          onSelect={(d) => setFilter("date", d)}
        />
        <BotonFecha
          etiqueta="Hoy"
          dia={datos.hoy}
          actual={datos.matchDay}
          onSelect={(d) => setFilter("date", d)}
        />
        <BotonFecha
          etiqueta="Mañana"
          dia={correrDia(datos.hoy, 1)}
          actual={datos.matchDay}
          onSelect={(d) => setFilter("date", d)}
        />
      </nav>

      <p className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <CalendarDays className="h-4 w-4 text-brand" aria-hidden="true" />
        {/* `formatDate` fija UTC-3, así que server y cliente muestran lo mismo.
            El día es una fecha sin hora: se le agrega el mediodía para que el
            ajuste de zona no lo corra al día anterior. */}
        <span className="capitalize">
          {formatDate(`${datos.matchDay}T12:00:00Z`, "EEEE d 'de' MMMM")}
        </span>
        {datos.actualizadoEn && (
          <span className="text-xs text-gray-500 dark:text-gray-500">
            · actualizado {formatDate(datos.actualizadoEn, "HH:mm")}
          </span>
        )}
      </p>

      {datos.aviso && (
        <div
          role="status"
          className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
        >
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>{datos.aviso}</p>
        </div>
      )}

      {/* Búsqueda y filtro */}
      <div className="rounded-2xl border border-white/50 bg-white/80 p-4 shadow-lg backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-800/80">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            />
            <Input
              aria-label="Buscar equipo, liga o país"
              placeholder="Buscar equipo, liga o país..."
              className="h-11 rounded-xl border-gray-200 bg-white pl-10 focus:border-brand focus:ring-2 focus:ring-brand/30 dark:border-gray-600 dark:bg-gray-700"
              value={values.q}
              onChange={(e) => setFilter("q", e.target.value)}
            />
          </div>

          <Button
            type="button"
            variant={soloEnVivo ? "default" : "outline"}
            aria-pressed={soloEnVivo}
            onClick={() => setFilter("envivo", soloEnVivo ? "" : "1")}
            className={`h-11 shrink-0 rounded-xl ${
              soloEnVivo
                ? "bg-green-600 text-white hover:bg-green-700"
                : "border-gray-200 dark:border-gray-600"
            }`}
          >
            <span className="relative mr-2 flex h-2 w-2">
              <span
                className={`absolute inline-flex h-full w-full rounded-full ${
                  soloEnVivo ? "bg-white" : "bg-green-500"
                } opacity-75 motion-safe:animate-ping`}
              />
              <span
                className={`relative inline-flex h-2 w-2 rounded-full ${
                  soloEnVivo ? "bg-white" : "bg-green-500"
                }`}
              />
            </span>
            Solo en vivo
            {datos.totales.enVivo > 0 && (
              <Badge
                className={`ml-2 border-0 ${
                  soloEnVivo ? "bg-white text-green-700" : "bg-green-600 text-white"
                }`}
              >
                {datos.totales.enVivo}
              </Badge>
            )}
          </Button>

          {hasActiveFilters && (
            <Button
              type="button"
              variant="outline"
              onClick={clearFilters}
              className="h-11 shrink-0 rounded-xl border-gray-200 dark:border-gray-600"
            >
              <X className="mr-2 h-4 w-4" aria-hidden="true" />
              Limpiar
            </Button>
          )}
        </div>

        <p className="mt-3 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
          <RefreshCw className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
          Mostrando {visibles} de {datos.totales.partidos} partidos ·{" "}
          {ligasVisibles.length} {ligasVisibles.length === 1 ? "liga" : "ligas"}
          {esHoy && " · los resultados se actualizan solos"}
        </p>
      </div>

      {/* Listado */}
      {ligasVisibles.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title={
            datos.totales.partidos === 0
              ? "No hay partidos para esta fecha"
              : "Ningún partido coincide con la búsqueda"
          }
          description={
            datos.totales.partidos === 0
              ? "Probá con otra fecha: puede que no haya actividad en el calendario internacional."
              : "Probá con otro equipo, liga o país, o limpiá los filtros."
          }
          action={
            hasActiveFilters ? (
              <Button type="button" variant="brand" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-6">
          {ligasVisibles.map((liga) => (
            <LigaBloque key={liga.leagueId} liga={liga} />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Aplica búsqueda y "solo en vivo" a los grupos ya ordenados.
 *
 * Una liga se conserva **entera** si el término coincide con su nombre o país
 * (buscar "Argentina" tiene que traer la fecha completa del torneo, no filtrar
 * los equipos que se llamen así); si no, se filtra partido por partido y la
 * liga desaparece si no queda ninguno. `enVivo` se recalcula sobre lo que
 * quedó: si no, el contador del encabezado hablaría de partidos ocultos.
 */
function filtrarLigas(
  ligas: readonly GrupoLiga[],
  termino: string,
  soloEnVivo: boolean,
): GrupoLiga[] {
  if (!termino && !soloEnVivo) return [...ligas];

  const resultado: GrupoLiga[] = [];

  for (const liga of ligas) {
    const ligaCoincide =
      !termino ||
      liga.leagueName.toLowerCase().includes(termino) ||
      (liga.leagueCountry ?? "").toLowerCase().includes(termino);

    const partidos = liga.partidos.filter((p) => {
      if (soloEnVivo && !estaEnVivo(p.estado)) return false;
      if (!termino) return true;
      return (
        ligaCoincide ||
        p.homeTeamName.toLowerCase().includes(termino) ||
        p.awayTeamName.toLowerCase().includes(termino)
      );
    });

    if (partidos.length > 0) {
      resultado.push({
        ...liga,
        partidos,
        enVivo: partidos.filter((p) => estaEnVivo(p.estado)).length,
      });
    }
  }

  return resultado;
}

function BotonFecha({
  etiqueta,
  dia,
  actual,
  onSelect,
}: Readonly<{
  etiqueta: string;
  dia: string;
  actual: string;
  onSelect: (dia: string) => void;
}>) {
  const activo = dia === actual;

  return (
    <Button
      type="button"
      variant={activo ? "brand" : "outline"}
      aria-current={activo ? "date" : undefined}
      // min-h-11 = 44px: objetivo táctil mínimo en mobile.
      className={`min-h-11 rounded-xl px-5 ${
        activo ? "" : "border-gray-200 dark:border-gray-600"
      }`}
      onClick={() => onSelect(dia)}
    >
      {etiqueta}
    </Button>
  );
}
