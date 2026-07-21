import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, AlertTriangle, Gavel } from "lucide-react";
import type { SuspensionView } from "@modules/torneos/actions/suspensions";

const REASON_META: Record<
  SuspensionView["reason"],
  { label: string; icon: typeof ShieldAlert; className: string }
> = {
  ROJA: {
    label: "Roja",
    icon: ShieldAlert,
    className: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300",
  },
  ACUMULACION: {
    label: "Acumulación",
    icon: AlertTriangle,
    className:
      "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
  },
  MANUAL: {
    label: "Manual",
    icon: Gavel,
    className:
      "bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300",
  },
};

/**
 * Lista presentacional de sancionados (N8). Sirve para la vista pública y como
 * cuerpo de la sección admin. `onCancel` habilita el botón de cancelar (solo
 * para suspensiones MANUAL, decisión del organizador).
 */
export function SuspensionsList({
  suspensions,
  emptyLabel = "No hay jugadores sancionados",
  renderAction,
}: {
  suspensions: SuspensionView[];
  emptyLabel?: string;
  renderAction?: (s: SuspensionView) => React.ReactNode;
}) {
  if (suspensions.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500 dark:text-gray-400">
        <ShieldAlert className="w-10 h-10 mx-auto mb-3 opacity-40" />
        <p className="text-sm">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {suspensions.map((s) => {
        const meta = REASON_META[s.reason];
        const Icon = meta.icon;
        return (
          <li
            key={s.id}
            className="flex items-center gap-3 sm:gap-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800/60 p-3"
          >
            {s.player.imageUrl ? (
              <Image
                src={s.player.imageUrl}
                alt={s.player.name}
                width={40}
                height={40}
                className="rounded-full object-cover shrink-0 h-10 w-10"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-brand/20 to-brand-2/20 flex items-center justify-center text-sm font-semibold text-brand shrink-0">
                {s.player.name.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-900 dark:text-white truncate">
                {s.player.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {s.team.name}
                {s.notes ? ` · ${s.notes}` : ""}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Badge className={`border-0 ${meta.className}`}>
                <Icon className="w-3 h-3 mr-1" />
                {meta.label}
              </Badge>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                {s.matchesRemaining}{" "}
                {s.matchesRemaining === 1 ? "fecha" : "fechas"}
              </span>
              {renderAction?.(s)}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
