"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import type { FieldValues, SubmitHandler, UseFormReturn } from "react-hook-form";
import type { LucideIcon } from "lucide-react";
import { AlertCircle, Loader2, Save } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { DraftBanner, type FormDraft } from "@/components/shared/form/DraftBanner";
import { cn } from "@/lib/utils";

/**
 * Caparazón único de los formularios largos del panel (F3) — patrón §11 de
 * docs/UI_PATTERNS.md.
 *
 * Un formulario de 15-25 campos no entra en un `Dialog` centrado: quedaba una
 * caja con scroll interno donde el botón "Guardar" vivía fuera del viewport y
 * había que scrollear hasta el fondo para encontrarlo. Acá el formulario es un
 * panel lateral en desktop y una pantalla completa en mobile, con el header y
 * la barra de acciones SIEMPRE visibles (sticky) y solo el cuerpo scrolleando.
 *
 * Resuelve de una vez, para todos los formularios:
 * - Loading de submit consistente (sale de `formState.isSubmitting`, no de un
 *   `useState` que cada pantalla apagaba a mano en un `finally`).
 * - Resumen de errores accesible (`role="alert"`) + foco automático en el
 *   primer campo inválido (default de react-hook-form).
 * - Guarda de cambios sin guardar: cerrar con el form sucio pide confirmación
 *   (`ConfirmDialog`) en vez del `confirm()` nativo que prohíbe AGENT_RULES.
 * - Borradores: si se le pasa un `draft`, muestra el aviso de restauración.
 */
export interface FormSheetProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  onSubmit: SubmitHandler<T>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Disparador declarativo. Omitir si la pantalla controla `open` a mano. */
  trigger?: ReactNode;
  title: string;
  description?: string;
  icon: LucideIcon;
  submitLabel: string;
  submitIcon?: LucideIcon;
  cancelLabel?: string;
  /** Ancho en desktop. `md` (≈576px) alcanza para 1 columna; `lg` para 2. */
  size?: "md" | "lg";
  /** Borrador autoguardado (`useFormDraft`). Solo se usa en alta, no en edición. */
  draft?: FormDraft;
  children: ReactNode;
}

export function FormSheet<T extends FieldValues>({
  form,
  onSubmit,
  open,
  onOpenChange,
  trigger,
  title,
  description,
  icon: Icon,
  submitLabel,
  submitIcon: SubmitIcon = Save,
  cancelLabel = "Cancelar",
  size = "lg",
  draft,
  children,
}: Readonly<FormSheetProps<T>>) {
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  const { isSubmitting, isDirty, errors } = form.formState;
  const errorCount = Object.keys(errors).length;

  const close = () => {
    setConfirmDiscard(false);
    onOpenChange(false);
    form.reset();
  };

  // Cerrar (X, Escape, click en el overlay) con cambios sin guardar no puede
  // descartarlos en silencio: son 20 campos de trabajo del organizador.
  const handleOpenChange = (next: boolean) => {
    if (isSubmitting) return;
    if (!next && isDirty) {
      setConfirmDiscard(true);
      return;
    }
    if (next) draft?.check();
    onOpenChange(next);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={handleOpenChange}>
        {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}

        <SheetContent
          side="right"
          className={cn(
            "flex h-dvh w-full flex-col gap-0 p-0",
            size === "lg" ? "sm:max-w-2xl" : "sm:max-w-xl",
          )}
          // El foco arranca en el primer campo, no en el botón de cerrar
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {/* Espina de marca: acento vertical en el borde por el que entra el panel */}
          <div
            aria-hidden="true"
            className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-brand via-brand-mid to-brand-2"
          />

          <SheetHeader className="shrink-0 space-y-0 border-b border-gray-200 py-4 pr-14 pl-6 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-mid shadow-lg shadow-brand/25">
                <Icon className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <SheetTitle className="truncate text-xl font-bold text-gray-900 dark:text-white">
                  {title}
                </SheetTitle>
                {description && (
                  <SheetDescription className="truncate text-sm text-gray-500 dark:text-gray-400">
                    {description}
                  </SheetDescription>
                )}
              </div>
            </div>
          </SheetHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              noValidate
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-5 sm:px-6">
                {draft && <DraftBanner draft={draft} />}
                {children}
              </div>

              <div className="shrink-0 space-y-3 border-t border-gray-200 bg-white/95 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-sm sm:px-6 dark:border-gray-800 dark:bg-gray-950/95">
                {errorCount > 0 && (
                  <p
                    role="alert"
                    className="flex items-center gap-2 text-sm font-medium text-red-600 dark:text-red-400"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {errorCount === 1
                      ? "Revisá el campo marcado en rojo."
                      : `Revisá los ${errorCount} campos marcados en rojo.`}
                  </p>
                )}

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
                  {isDirty && !isSubmitting && (
                    <span className="mr-auto hidden items-center gap-2 text-xs text-gray-500 sm:flex dark:text-gray-400">
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-amber-500"
                        aria-hidden="true"
                      />
                      Cambios sin guardar
                    </span>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleOpenChange(false)}
                    disabled={isSubmitting}
                    className="h-11 rounded-xl px-6"
                  >
                    {cancelLabel}
                  </Button>
                  <Button
                    type="submit"
                    variant="brand"
                    disabled={isSubmitting}
                    className="h-11 px-6 font-semibold"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2
                          className="h-4 w-4 animate-spin"
                          aria-hidden="true"
                        />
                        Guardando…
                      </>
                    ) : (
                      <>
                        <SubmitIcon className="h-4 w-4" aria-hidden="true" />
                        {submitLabel}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={confirmDiscard}
        onOpenChange={setConfirmDiscard}
        tone="warning"
        title="¿Descartar los cambios?"
        description="Los datos que cargaste en este formulario se pierden. Esta acción no se puede deshacer."
        confirmLabel="Descartar"
        cancelLabel="Seguir editando"
        onConfirm={close}
      />
    </>
  );
}
