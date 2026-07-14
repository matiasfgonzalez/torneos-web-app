"use client";

import { useCallback, useEffect, useState } from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";

const PREFIX = "golazo:draft:";
const DEBOUNCE_MS = 800;
/** Un borrador viejo confunde más de lo que ayuda. */
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

interface StoredDraft {
  savedAt: number;
  values: unknown;
}

export interface FormDraft {
  /** Borrador encontrado en el equipo, todavía no restaurado. */
  pending: { savedAt: number } | null;
  /** Buscar un borrador. Se llama al abrir el formulario (event handler). */
  check: () => void;
  /** Cargar el borrador en el formulario. */
  restore: () => void;
  /** Ignorar el borrador pero conservarlo. */
  dismiss: () => void;
  /** Borrar el borrador (al guardar con éxito, o al descartarlo). */
  clear: () => void;
}

const read = (key: string): StoredDraft | null => {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredDraft;
    if (Date.now() - parsed.savedAt > MAX_AGE_MS) {
      localStorage.removeItem(PREFIX + key);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

/**
 * Autoguardado de borradores en `localStorage` (F3).
 *
 * Motivación: crear un torneo son ~25 campos. Cerrar la pestaña, recargar o un
 * clic afuera del panel tiraba todo ese trabajo. Ahora los valores se guardan
 * solos mientras se escribe y, al reabrir el formulario, se ofrece retomarlos.
 *
 * Solo para ALTAS. En edición la fuente de verdad es la base, no el equipo del
 * usuario: un borrador viejo pisaría datos que alguien más pudo haber cambiado.
 */
export function useFormDraft<T extends FieldValues>(
  form: UseFormReturn<T>,
  options: Readonly<{ key: string; enabled: boolean }>,
): FormDraft {
  const { key, enabled } = options;
  const [pending, setPending] = useState<{ savedAt: number } | null>(null);

  // El watch se suscribe a cada tecla; escribir en localStorage en cada una es
  // caro (JSON.stringify + I/O sincrónico), así que se debouncea.
  useEffect(() => {
    if (!enabled) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    const subscription = form.watch((values) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        try {
          const draft: StoredDraft = { savedAt: Date.now(), values };
          localStorage.setItem(PREFIX + key, JSON.stringify(draft));
        } catch {
          // Cuota llena o modo privado: el borrador es una comodidad, no rompe el form
        }
      }, DEBOUNCE_MS);
    });

    return () => {
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, [form, key, enabled]);

  const check = useCallback(() => {
    if (!enabled) return;
    const draft = read(key);
    setPending(draft ? { savedAt: draft.savedAt } : null);
  }, [key, enabled]);

  const restore = useCallback(() => {
    const draft = read(key);
    if (draft) {
      // `keepDefaultValues` mantiene los defaults originales como referencia, así
      // el formulario queda `isDirty` y la guarda de cambios sin guardar aplica.
      form.reset(draft.values as T, { keepDefaultValues: true });
    }
    setPending(null);
  }, [form, key]);

  const dismiss = useCallback(() => setPending(null), []);

  const clear = useCallback(() => {
    try {
      localStorage.removeItem(PREFIX + key);
    } catch {
      // idem
    }
    setPending(null);
  }, [key]);

  return { pending, check, restore, dismiss, clear };
}
