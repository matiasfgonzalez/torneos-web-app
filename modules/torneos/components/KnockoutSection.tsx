"use client";

import { useState } from "react";
import { LayoutList, Network } from "lucide-react";

import { IMatch } from "@modules/torneos/types/tournament-teams.types";
import { KnockoutBracket } from "@modules/torneos/components/KnockoutBracket";
import { TournamentBracket } from "@modules/torneos/components/TournamentBracket";

type View = "bracket" | "list";

/**
 * Fase final con dos vistas (S13c): el **cuadro** (bracket, por defecto — es lo
 * que el hincha quiere ver de un torneo de copa) y el **listado completo** de
 * cruces por ronda. Un toggle cambia entre las dos; el cuadro manda porque
 * cuenta la historia de la fase de un vistazo, la lista es para el detalle.
 */
export function KnockoutSection({
  matches,
  title = "Fase Final",
  description = "Eliminación directa",
}: Readonly<{ matches: IMatch[]; title?: string; description?: string }>) {
  const [view, setView] = useState<View>("bracket");

  return (
    <section className="space-y-4">
      {/* Toggle segmentado: Cuadro / Listado */}
      <div className="flex justify-center">
        <div
          role="tablist"
          aria-label="Vista de la fase final"
          className="inline-flex rounded-xl border border-gray-200 bg-card p-1 shadow-sm dark:border-gray-700"
        >
          <ViewTab
            active={view === "bracket"}
            onClick={() => setView("bracket")}
            icon={<Network className="h-4 w-4" aria-hidden="true" />}
            label="Cuadro"
          />
          <ViewTab
            active={view === "list"}
            onClick={() => setView("list")}
            icon={<LayoutList className="h-4 w-4" aria-hidden="true" />}
            label="Listado completo"
          />
        </div>
      </div>

      {view === "bracket" ? (
        <TournamentBracket
          matches={matches}
          title={title}
          description="Las llaves de la eliminación directa"
        />
      ) : (
        <KnockoutBracket
          matches={matches}
          title={title}
          description={description}
        />
      )}
    </section>
  );
}

function ViewTab({
  active,
  onClick,
  icon,
  label,
}: Readonly<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}>) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 ease-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
        active
          ? "bg-gradient-to-r from-brand to-brand-mid text-white shadow-md shadow-brand/25"
          : "text-gray-600 hover:text-brand dark:text-gray-400 dark:hover:text-brand"
      }`}
    >
      {icon}
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
}

export default KnockoutSection;
