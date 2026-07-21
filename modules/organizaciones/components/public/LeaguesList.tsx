"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, MapPin, Trophy, ChevronRight, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { OrganizationListItem } from "@modules/organizaciones/actions/getPublicOrganizations";

/**
 * Grid buscable del catálogo de ligas (`/ligas`). Búsqueda cliente sobre
 * nombre y localidad — el listado es chico y ya viene filtrado del server, así
 * que no hace falta paginar ni refetchear.
 */
export default function LeaguesList({
  leagues,
}: Readonly<{ leagues: OrganizationListItem[] }>) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return leagues;
    return leagues.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        (l.locality?.toLowerCase().includes(q) ?? false),
    );
  }, [leagues, query]);

  return (
    <div className="space-y-8">
      {/* Buscador */}
      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="search"
          placeholder="Buscá por nombre o localidad…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-11 h-12 rounded-2xl"
          aria-label="Buscar ligas"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
          <Shield className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>
            {query
              ? `No encontramos ligas para "${query}".`
              : "Todavía no hay ligas publicadas."}
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((league) => (
            <Link
              key={league.id}
              href={`/liga/${league.slug}`}
              className="group relative flex flex-col rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm hover:border-brand/50 hover:shadow-xl hover:shadow-brand/10 transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                {league.logoUrl ? (
                  <Image
                    src={league.logoUrl}
                    alt={league.name}
                    width={56}
                    height={56}
                    className="h-14 w-14 rounded-2xl object-cover ring-2 ring-brand/10"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-brand-2 shadow-lg shadow-brand/20">
                    <Trophy className="h-7 w-7 text-white" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold text-gray-900 dark:text-white group-hover:text-brand transition-colors">
                    {league.name}
                  </h3>
                  {league.locality && (
                    <p className="mt-0.5 inline-flex items-center gap-1 truncate text-xs text-gray-500 dark:text-gray-400">
                      <MapPin className="h-3.5 w-3.5 text-brand" />
                      {league.locality}
                    </p>
                  )}
                </div>
              </div>

              {league.description && (
                <p className="mt-4 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                  {league.description}
                </p>
              )}

              <div className="mt-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-4">
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Trophy className="h-4 w-4 text-brand" />
                  {league.tournamentCount}{" "}
                  {league.tournamentCount === 1 ? "torneo" : "torneos"}
                </span>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-brand">
                  Ver liga
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
