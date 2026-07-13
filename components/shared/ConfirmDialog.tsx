"use client";

import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Confirmación de acciones destructivas/de alto impacto (F0) — patrón §8 de
 * docs/UI_PATTERNS.md. Nunca `confirm()` nativo en código nuevo.
 *
 * Uso:
 * <ConfirmDialog
 *   trigger={<Button variant="destructive" size="sm">Eliminar</Button>}
 *   title="¿Eliminar partido?"
 *   description={<>Se va a eliminar el partido <b>{nombre}</b>...</>}
 *   confirmLabel="Eliminar"
 *   onConfirm={handleDelete}   // puede ser async: muestra loading
 * />
 */
export interface ConfirmDialogProps {
  /** Disparador declarativo. Omitir en modo controlado (open/onOpenChange) —
      necesario cuando el disparador vive en un DropdownMenu que se desmonta. */
  trigger?: React.ReactNode;
  /** Modo controlado (opcional) */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Tono de la operación. danger = rojo (default), warning = ámbar. */
  tone?: "danger" | "warning";
  icon?: LucideIcon;
  onConfirm: () => void | Promise<void>;
}

export function ConfirmDialog({
  trigger,
  open: controlledOpen,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  tone = "danger",
  icon: Icon = AlertTriangle,
  onConfirm,
}: ConfirmDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = (v: boolean) => {
    if (isControlled) onOpenChange?.(v);
    else setUncontrolledOpen(v);
  };

  const handleConfirm = async () => {
    setPending(true);
    try {
      await onConfirm();
      setOpen(false);
    } finally {
      setPending(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={(v) => !pending && setOpen(v)}>
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
      <AlertDialogContent>
        <AlertDialogHeader>
          <div
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center mb-2",
              tone === "danger"
                ? "bg-red-50 dark:bg-red-900/20"
                : "bg-amber-50 dark:bg-amber-900/20",
            )}
          >
            <Icon
              className={cn(
                "w-6 h-6",
                tone === "danger"
                  ? "text-red-600 dark:text-red-400"
                  : "text-amber-600 dark:text-amber-400",
              )}
              aria-hidden="true"
            />
          </div>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>{description}</div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>
            {cancelLabel}
          </AlertDialogCancel>
          {/* Botón propio (no AlertDialogAction) para controlar el estado
              de loading sin cerrar el diálogo hasta que termine la acción */}
          <Button
            variant={tone === "danger" ? "destructive" : "default"}
            className={cn(
              tone === "warning" &&
                "bg-amber-600 hover:bg-amber-700 text-white",
            )}
            disabled={pending}
            onClick={handleConfirm}
          >
            {pending && (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            )}
            {confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
