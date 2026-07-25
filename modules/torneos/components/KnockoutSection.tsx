"use client";

import { useMemo, useState } from "react";
import { LayoutList, Network, Trophy } from "lucide-react";

import { IMatch } from "@modules/torneos/types/tournament-teams.types";
import { KnockoutBracket } from "@modules/torneos/components/KnockoutBracket";
import { TournamentBracket } from "@modules/torneos/components/TournamentBracket";
import { groupMatchesByCup } from "@/lib/standings/cup-groups";

type View = "bracket" | "list";

/**
 * Fase final con dos vistas (S13c): el **cuadro** (bracket, por defecto — es lo
 * que el hincha quiere ver de un torneo de copa) y el **listado completo** de
 * cruces por ronda. Un toggle cambia entre las dos; el cuadro manda porque
 * cuenta la historia de la fase de un vistazo, la lista es para el detalle.
 *
 * **Separación por copa (S13):** un torneo puede tener varias copas a la vez
 * (Oro / Plata / Bronce). Cada una es un cuadro propio — dibujarlas juntas
 * mezclaba dos finales distintas en la misma columna. Con más de una copa
 * aparece un selector arriba y se muestra una por vez; con una sola (el caso
 * normal) no hay selector y la pantalla queda igual que antes.
 */
export function KnockoutSection({
  matches,
  title = "Fase Final",
  description = "Eliminación directa",
}: Readonly<{ matches: IMatch[]; title?: string; description?: string }>) {
  const [view, setView] = useState<View>("bracket");
  const [cupIndex, setCupIndex] = useState(0);

  const cups = useMemo(() => groupMatchesByCup(matches), [matches]);

  if (cups.length === 0) return null;

  // Si se borró una copa y el índice quedó fuera de rango, cae a la primera.
  const active = cups[cupIndex] ?? cups[0];
  // Con copas, el nombre de la copa manda sobre el título genérico: el hincha
  // está mirando "Copa de Oro", no "Fase Final".
  const activeTitle = active.cupName ?? title;

  return (
    <section className="space-y-4">
      {cups.length > 1 && (
        <div className="flex justify-center">
          <div
            role="tablist"
            aria-label="Copa"
            className="inline-flex max-w-full flex-wrap justify-center gap-1 rounded-xl border border-gray-200 bg-card p-1 shadow-sm dark:border-gray-700"
          >
            {cups.map((cup, i) => (
              <SegmentedTab
                key={cup.cupName ?? "__sin-copa__"}
                active={i === cupIndex}
                onClick={() => setCupIndex(i)}
                icon={<Trophy className="h-4 w-4" aria-hidden="true" />}
                label={cup.cupName ?? title}
              />
            ))}
          </div>
        </div>
      )}

      {/* Toggle segmentado: Cuadro / Listado */}
      <div className="flex justify-center">
        <div
          role="tablist"
          aria-label="Vista de la fase final"
          className="inline-flex rounded-xl border border-gray-200 bg-card p-1 shadow-sm dark:border-gray-700"
        >
          <SegmentedTab
            active={view === "bracket"}
            onClick={() => setView("bracket")}
            icon={<Network className="h-4 w-4" aria-hidden="true" />}
            label="Cuadro"
          />
          <SegmentedTab
            active={view === "list"}
            onClick={() => setView("list")}
            icon={<LayoutList className="h-4 w-4" aria-hidden="true" />}
            label="Listado completo"
          />
        </div>
      </div>

      {/* `key`: al cambiar de copa se remonta el cuadro para que vuelva a
          centrar el scroll en su propia final. */}
      {view === "bracket" ? (
        <TournamentBracket
          key={active.cupName ?? "__sin-copa__"}
          matches={active.matches}
          title={activeTitle}
          description="Las llaves de la eliminación directa"
        />
      ) : (
        <KnockoutBracket
          key={active.cupName ?? "__sin-copa__"}
          matches={active.matches}
          title={activeTitle}
          description={description}
        />
      )}
    </section>
  );
}

function SegmentedTab({
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
