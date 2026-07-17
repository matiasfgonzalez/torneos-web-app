"use client";

import { useState } from "react";
import Link from "next/link";
import { Radio, Shield, ChevronRight } from "lucide-react";
import { MatchStatus } from "@prisma/client";
import { useLivePoll } from "@/hooks/use-live-poll";
import type { LiveMatchCard } from "@modules/partidos/utils/liveState";

/** Cada cuánto refrescamos la lista de partidos en vivo (ms). */
const LIVE_LIST_POLL_MS = 20000;

/**
 * Hub "En vivo ahora" (S6): franja arriba de `/partidos` con los partidos que se
 * están jugando en este momento, con marcador y minuto que se actualizan solos
 * por polling. Si no hay nada en vivo, no renderiza nada (no ensucia la página).
 */
export function LiveNowSection() {
  const [matches, setMatches] = useState<LiveMatchCard[]>([]);

  const refresh = async () => {
    try {
      const res = await fetch("/api/matches/live", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setMatches(Array.isArray(data) ? data : []);
    } catch {
      // Sin conexión: reintenta en el próximo tick.
    }
  };

  useLivePoll(refresh, LIVE_LIST_POLL_MS, true);

  if (matches.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="mb-4 flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
        </span>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          En vivo ahora
        </h2>
        <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
          {matches.length}
        </span>
        <Radio className="h-4 w-4 text-red-500" aria-hidden="true" />
      </div>

      <div className="flex snap-x gap-4 overflow-x-auto pb-2 scrollbar-hide sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3">
        {matches.map((m) => (
          <Link
            key={m.id}
            href={`/partidos/${m.id}`}
            className="group relative min-w-[280px] snap-start overflow-hidden rounded-2xl border border-red-200 bg-white/90 shadow-lg backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:shadow-xl dark:border-red-500/30 dark:bg-gray-800/80 sm:min-w-0"
          >
            <div className="h-1 bg-gradient-to-r from-red-500 to-rose-500" />
            <div className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-red-600 dark:bg-red-500/10 dark:text-red-400">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />
                  </span>
                  {m.status === MatchStatus.ENTRETIEMPO ? "ET" : "En vivo"}
                  {m.currentMinute != null && ` · ${m.currentMinute}'`}
                </span>
                <span className="max-w-[45%] truncate text-xs text-gray-500 dark:text-gray-400">
                  {m.tournamentName}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <TeamCell
                  name={m.home.shortName || m.home.name}
                  logoUrl={m.home.logoUrl}
                />
                <div className="shrink-0 text-center font-mono text-2xl font-bold text-gray-900 dark:text-white">
                  {m.homeScore ?? 0}
                  <span className="mx-1 text-gray-300 dark:text-gray-600">-</span>
                  {m.awayScore ?? 0}
                </div>
                <TeamCell
                  name={m.away.shortName || m.away.name}
                  logoUrl={m.away.logoUrl}
                  align="right"
                />
              </div>

              <div className="mt-3 flex items-center justify-end gap-1 text-xs font-semibold text-brand opacity-0 transition-opacity group-hover:opacity-100">
                Ver en vivo
                <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function TeamCell({
  name,
  logoUrl,
  align = "left",
}: {
  name: string;
  logoUrl: string | null;
  align?: "left" | "right";
}) {
  return (
    <div
      className={`flex min-w-0 flex-1 items-center gap-2 ${
        align === "right" ? "flex-row-reverse text-right" : ""
      }`}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-700">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <Shield className="h-4 w-4 text-gray-400" />
        )}
      </div>
      <span className="truncate text-sm font-semibold text-gray-900 dark:text-white">
        {name}
      </span>
    </div>
  );
}
