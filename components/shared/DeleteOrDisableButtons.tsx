"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Power, PowerOff, Trash2, Archive } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

/**
 * Baja de una entidad con historial (F3, 2026-07-14) — patrón §8b de
 * docs/UI_PATTERNS.md.
 *
 * La regla, para toda entidad que participe del historial deportivo:
 *
 * - **Sin relaciones** (se cargó y nunca se usó) → se puede **eliminar** de
 *   verdad. No hay historial que perder.
 * - **Con relaciones** → **nunca** se elimina: se **deshabilita**. Los datos y
 *   el historial se siguen viendo; lo que se pierde es la posibilidad de
 *   seguir usándola (sumar el jugador a un equipo, inscribir el equipo en un
 *   torneo nuevo).
 *
 * El motivo no es estético: las FK del schema son `onDelete: Cascade`, así que
 * un borrado físico con historial se llevaría puestos goles, tarjetas,
 * suspensiones y estadísticas de partidos ya jugados.
 *
 * Este componente decide **qué le ofrece al usuario** según `relationCount`,
 * pero la regla la vuelve a aplicar el server action — el cliente puede tener
 * una lista desactualizada.
 */
export interface DeleteOrDisableButtonsProps {
  /** Nombre de la entidad en singular y minúscula: "jugador", "equipo". */
  entityLabel: string;
  /** Nombre propio del registro, para el copy de los diálogos. */
  name: string;
  enabled: boolean;
  /** Cuántas relaciones bloquean el borrado (0 ⇒ eliminable). */
  relationCount: number;
  /** Qué son esas relaciones, en plural: "torneos", "equipos". */
  relationLabel: string;
  /** Qué deja de poder hacerse al deshabilitar. */
  disableConsequence: string;
  onDelete: () => Promise<{ success: boolean; error?: string; message?: string }>;
  onToggleEnabled: () => Promise<{
    success: boolean;
    error?: string;
    message?: string;
  }>;
  /** A dónde ir después de un borrado exitoso. Necesario si el botón vive en la
      página de detalle del propio registro: al eliminarlo, esa página ya no existe. */
  redirectAfterDelete?: string;
}

export function DeleteOrDisableButtons({
  entityLabel,
  name,
  enabled,
  relationCount,
  relationLabel,
  disableConsequence,
  onDelete,
  onToggleEnabled,
  redirectAfterDelete,
}: Readonly<DeleteOrDisableButtonsProps>) {
  const [pending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const router = useRouter();

  const hasHistory = relationCount > 0;

  const run = (
    action: () => Promise<{ success: boolean; error?: string; message?: string }>,
    { isDelete = false } = {},
  ) =>
    new Promise<void>((resolve) => {
      startTransition(async () => {
        const res = await action();
        if (res.success) {
          toast.success(res.message ?? "Listo");
          // Tras borrar desde la ficha del propio registro, esa ruta ya no existe.
          if (isDelete && redirectAfterDelete) router.push(redirectAfterDelete);
        } else {
          toast.error(res.error ?? "No se pudo completar la acción");
        }
        resolve();
      });
    });

  return (
    <>
      {/* Habilitar / deshabilitar — siempre disponible */}
      <Button
        variant="outline"
        size="icon"
        disabled={pending}
        onClick={() => run(onToggleEnabled)}
        title={enabled ? "Deshabilitar" : "Habilitar"}
        className={
          enabled
            ? "h-9 w-9 rounded-lg border-amber-300 dark:border-amber-500/50 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10"
            : "h-9 w-9 rounded-lg border-green-300 dark:border-green-500/50 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-500/10"
        }
      >
        {pending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : enabled ? (
          <PowerOff className="w-4 h-4" />
        ) : (
          <Power className="w-4 h-4" />
        )}
        <span className="sr-only">
          {enabled ? "Deshabilitar" : "Habilitar"} {name}
        </span>
      </Button>

      {/* Baja. Con historial, el diálogo no ofrece eliminar: ofrece deshabilitar.
          Si ya está deshabilitado y tiene historial no hay nada que ofrecer —
          la única acción posible es rehabilitarlo, y para eso está el toggle. */}
      {(!hasHistory || enabled) && (
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        trigger={
          <Button
            variant="outline"
            size="icon"
            disabled={pending}
            title={hasHistory ? `Dar de baja ${entityLabel}` : "Eliminar"}
            className="h-9 w-9 rounded-lg border-red-300 dark:border-red-500/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
          >
            {hasHistory ? (
              <Archive className="w-4 h-4" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            <span className="sr-only">
              {hasHistory ? "Dar de baja" : "Eliminar"} {name}
            </span>
          </Button>
        }
        tone={hasHistory ? "warning" : "danger"}
        icon={hasHistory ? Archive : Trash2}
        title={
          hasHistory
            ? `¿Deshabilitar ${entityLabel}?`
            : `¿Eliminar ${entityLabel}?`
        }
        confirmLabel={hasHistory ? "Deshabilitar" : "Eliminar definitivamente"}
        description={
          hasHistory ? (
            <>
              <strong className="text-gray-900 dark:text-white">{name}</strong>{" "}
              ya participó en {relationCount} {relationLabel}, así que{" "}
              <strong>no se puede eliminar</strong>: perderías su historial
              (goles, tarjetas, sanciones y estadísticas de partidos ya
              jugados).
              <span className="block mt-2">
                En su lugar se va a <strong>deshabilitar</strong>: sus datos y
                su historial se van a seguir viendo, pero {disableConsequence}.
                Podés volver a habilitarlo cuando quieras.
              </span>
            </>
          ) : (
            <>
              <strong className="text-gray-900 dark:text-white">{name}</strong>{" "}
              no tiene ninguna relación (nunca participó en un{" "}
              {relationLabel.replace(/s$/, "")}), así que se puede eliminar sin
              perder historial.
              <span className="block mt-2">
                Esta acción no se puede deshacer.
              </span>
            </>
          )
        }
        // Con historial el diálogo confirma una deshabilitación, no un borrado.
        onConfirm={() =>
          hasHistory
            ? run(onToggleEnabled)
            : run(onDelete, { isDelete: true })
        }
      />
      )}
    </>
  );
}
