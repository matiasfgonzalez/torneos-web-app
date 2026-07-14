"use client";

import { History } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FormDraft } from "@/hooks/use-form-draft";

export type { FormDraft };

/** "hace 5 minutos" / "hace 2 horas" / "el 12/07 a las 14:30" */
function timeAgo(savedAt: number): string {
  const minutes = Math.round((Date.now() - savedAt) / 60000);
  if (minutes < 1) return "recién";
  if (minutes < 60) return `hace ${minutes} ${minutes === 1 ? "minuto" : "minutos"}`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `hace ${hours} ${hours === 1 ? "hora" : "horas"}`;
  return `el ${new Date(savedAt).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
  })}`;
}

/**
 * Aviso de borrador recuperable (F3). Lo renderiza `FormSheet` cuando recibe un
 * `draft` de `useFormDraft` y hay algo guardado.
 *
 * No restaura solo: el usuario puede estar arrancando un torneo distinto del
 * que abandonó. Ofrece la opción y se corre del medio.
 */
export function DraftBanner({ draft }: Readonly<{ draft: FormDraft }>) {
  if (!draft.pending) return null;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-amber-900/50 dark:bg-amber-900/20">
      <div className="flex items-start gap-3">
        <History
          className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400"
          aria-hidden="true"
        />
        <div>
          <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
            Tenés un borrador sin terminar
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-300/80">
            Se guardó solo {timeAgo(draft.pending.savedAt)} en este equipo.
          </p>
        </div>
      </div>
      <div className="flex shrink-0 gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={draft.clear}
          className="h-10 border-amber-300 bg-transparent text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:text-amber-200 dark:hover:bg-amber-900/40"
        >
          Descartar
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={draft.restore}
          className="h-10 bg-amber-600 font-semibold text-white hover:bg-amber-700"
        >
          Retomar
        </Button>
      </div>
    </div>
  );
}
