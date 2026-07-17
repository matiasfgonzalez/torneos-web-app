"use client";

import { toast } from "sonner";

/**
 * Toast de límite de plan (402 del server) con acción "Mejorar plan" hacia
 * `/admin/plan` — la UI de upsell que N4 dejó pendiente (cerrada vía N14d).
 *
 * Después de N14c el 402 solo puede verlo un OWNER (crear/reactivar torneos y
 * aprobar inscripciones son suyos), que es exactamente quien puede contratar.
 *
 * Navegación dura a propósito: el toast vive fuera del árbol de React y no
 * siempre hay un router del App Router a mano en el caller.
 */
export function toastPlanLimit(message: string) {
  toast.error(message, {
    duration: 8000,
    action: {
      label: "Mejorar plan",
      onClick: () => {
        window.location.href = "/admin/plan";
      },
    },
  });
}
