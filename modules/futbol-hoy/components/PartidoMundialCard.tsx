import { Clock, MapPin, Shield } from "lucide-react";

import { SmartImage } from "@/components/shared/SmartImage";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/lib/formatDate";
import { estaEnVivo, mostrarMarcador } from "@/lib/futbol-hoy/estado";
import type { FixtureVista } from "@/lib/futbol-hoy/types";

/**
 * Una fila de partido dentro del bloque de su liga.
 *
 * Layout de tres columnas (local · marcador · visitante) que aguanta desde
 * 375px: los nombres truncan, el marcador nunca se comprime. En mobile el
 * nombre largo cede el lugar y se muestra igual completo con `truncate`, que es
 * preferible a partirlo en dos líneas y desalinear las filas entre sí.
 */
export function PartidoMundialCard({ partido }: Readonly<{ partido: FixtureVista }>) {
  const enVivo = estaEnVivo(partido.estado);
  const conMarcador = mostrarMarcador(partido.estado);
  const lugar = [partido.venueName, partido.venueCity].filter(Boolean).join(" · ");

  return (
    <article
      className={`rounded-xl border p-3 sm:p-4 transition-colors ${
        enVivo
          ? "border-green-300 bg-green-50/60 dark:border-green-500/40 dark:bg-green-500/5"
          : "border-gray-100 bg-card dark:border-gray-800"
      }`}
    >
      <div className="flex items-center gap-2 sm:gap-4">
        <EquipoCelda
          nombre={partido.homeTeamName}
          logoUrl={partido.homeTeamLogo}
        />

        <div className="w-20 shrink-0 text-center sm:w-24">
          {conMarcador ? (
            <p className="font-mono text-2xl font-bold text-gray-900 tabular-nums dark:text-white">
              {partido.homeGoals ?? 0}
              <span className="mx-1 text-gray-300 dark:text-gray-600">-</span>
              {partido.awayGoals ?? 0}
            </p>
          ) : (
            <p className="font-mono text-lg font-bold text-gray-700 tabular-nums dark:text-gray-200">
              {formatDate(partido.kickoff, "HH:mm")}
            </p>
          )}

          {/* El minuto solo aparece con el partido en curso: `minuto` ya viene
              en null para el resto de los estados (ver agrupar.ts). */}
          {partido.minuto !== null && (
            <p className="text-xs font-bold text-green-700 motion-safe:animate-pulse dark:text-green-400">
              {partido.minuto}&apos;
            </p>
          )}
        </div>

        <EquipoCelda
          nombre={partido.awayTeamName}
          logoUrl={partido.awayTeamLogo}
          alineacion="derecha"
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-2 dark:border-gray-800">
        <StatusBadge entity="match" status={partido.estado} className="text-xs" />

        <div className="flex min-w-0 items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
          {!conMarcador && (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
              {formatDate(partido.kickoff, "HH:mm")}
            </span>
          )}
          {lugar && (
            <span className="flex min-w-0 items-center gap-1">
              <MapPin
                className="h-3.5 w-3.5 shrink-0 text-brand-2"
                aria-hidden="true"
              />
              <span className="truncate">{lugar}</span>
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

function EquipoCelda({
  nombre,
  logoUrl,
  alineacion = "izquierda",
}: Readonly<{
  nombre: string;
  logoUrl: string | null;
  alineacion?: "izquierda" | "derecha";
}>) {
  return (
    <div
      className={`flex min-w-0 flex-1 items-center gap-2 sm:gap-3 ${
        alineacion === "derecha" ? "flex-row-reverse text-right" : ""
      }`}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 sm:h-10 sm:w-10">
        {logoUrl ? (
          <SmartImage
            src={logoUrl}
            alt=""
            width={40}
            height={40}
            className="h-full w-full object-contain"
          />
        ) : (
          <Shield className="h-4 w-4 text-gray-400" aria-hidden="true" />
        )}
      </div>
      <span className="truncate text-sm font-semibold text-gray-900 dark:text-white sm:text-base">
        {nombre}
      </span>
    </div>
  );
}
