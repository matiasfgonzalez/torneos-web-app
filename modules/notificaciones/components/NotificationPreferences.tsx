"use client";

import { useState, useTransition } from "react";
import { Mail } from "lucide-react";
import { toast } from "sonner";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { setEmailPreference } from "@modules/notificaciones/actions/preferences";
import type { PreferenceItem } from "@modules/notificaciones/types";

/**
 * Preferencias de email por categoría (S5).
 *
 * Solo se ofrece apagar el **email**: la campana no se apaga porque no
 * interrumpe a nadie. Ofrecer un switch por canal y categoría es una grilla de
 * 8 controles para un problema que nadie tiene.
 */
export function NotificationPreferences({
  initial,
  emailEnabled,
}: Readonly<{ initial: PreferenceItem[]; emailEnabled: boolean }>) {
  const [prefs, setPrefs] = useState(initial);
  const [, startTransition] = useTransition();

  const toggle = (category: string, value: boolean) => {
    const snapshot = prefs;
    setPrefs((prev) =>
      prev.map((p) => (p.category === category ? { ...p, email: value } : p)),
    );

    startTransition(async () => {
      const result = await setEmailPreference(
        category as PreferenceItem["category"],
        value,
      ).catch(() => null);

      if (!result?.ok) {
        setPrefs(snapshot);
        toast.error("No se pudo guardar la preferencia.");
      }
    });
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-1 flex items-center gap-2">
        <Mail className="h-4 w-4 text-brand" aria-hidden="true" />
        <h2 className="font-semibold text-gray-900 dark:text-white">
          Avisos por email
        </h2>
      </div>
      <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
        Elegí de qué te queremos avisar por mail. La campana te muestra todo
        igual.
      </p>

      {/* Sin RESEND_API_KEY no sale ningún mail. Mostrar switches que no hacen
          nada es peor que decirlo. */}
      {!emailEnabled && (
        <p className="mb-4 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
          El envío de emails todavía no está configurado en esta instalación.
          Tus preferencias se guardan y se aplican cuando se active.
        </p>
      )}

      <div className="space-y-4">
        {prefs.map((pref) => (
          <div
            key={pref.category}
            className="flex items-start justify-between gap-4"
          >
            <div className="min-w-0">
              <Label
                htmlFor={`pref-${pref.category}`}
                className="text-sm font-medium text-gray-900 dark:text-white"
              >
                {pref.label}
              </Label>
              <p className="mt-0.5 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                {pref.description}
              </p>
            </div>
            <Switch
              id={`pref-${pref.category}`}
              checked={pref.email}
              onCheckedChange={(value) => toggle(pref.category, value)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
