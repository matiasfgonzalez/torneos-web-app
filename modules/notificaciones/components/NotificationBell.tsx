"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Bell, CheckCheck, Loader2 } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  getMyNotifications,
  getUnreadCount,
  markAllAsRead,
  markAsRead,
} from "@modules/notificaciones/actions/notifications";
import type { NotificationItem } from "@modules/notificaciones/types";
import { NotificationRow } from "@modules/notificaciones/components/NotificationRow";

/** Cada cuánto se repregunta el contador. */
const POLL_MS = 60_000;
const PREVIEW_LIMIT = 8;

/**
 * Campana de notificaciones (S5).
 *
 * **Se trae sus propios datos.** La alternativa era que el layout los resolviera
 * y los pasara por props, pero la campana vive en el header público y en el
 * panel: eso obligaba a tocar los dos layouts y a pagar la query en cada
 * página, incluidas las que la campana no muestra.
 *
 * El contador se refresca por polling cada 60s. No es tiempo real y no hace
 * falta que lo sea: el push en vivo es S6 (live match center), y una campana
 * que se actualiza al minuto ya evita el "me enteré tres días después".
 *
 * La lista se pide **al abrir**, no al montar: el 95% de las veces la campana
 * no se abre, y esa query no se paga.
 */
export function NotificationBell({ className }: Readonly<{ className?: string }>) {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [items, setItems] = useState<NotificationItem[] | null>(null);
  const [pending, startTransition] = useTransition();

  const refreshCount = useCallback(() => {
    getUnreadCount()
      .then(setCount)
      // Si falla (offline, sesión vencida) no se rompe nada: el contador se
      // queda con el último valor y el próximo tick reintenta.
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    refreshCount();
    const timer = setInterval(refreshCount, POLL_MS);
    return () => clearInterval(timer);
  }, [refreshCount]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) return;
    // Siempre se recarga al abrir: entre el último poll y el click pudo pasar
    // cualquier cosa, y una lista vieja es peor que esperar 200ms.
    setItems(null);
    getMyNotifications(PREVIEW_LIMIT)
      .then((data) => {
        setItems(data);
        setCount(data.filter((n) => !n.readAt).length);
      })
      .catch(() => setItems([]));
  };

  const handleRead = (id: string) => {
    // Optimista: el click ya navega a otra página, así que esperar la respuesta
    // solo hace que la campana parpadee mientras se va.
    setItems((prev) =>
      prev?.map((n) =>
        n.id === id && !n.readAt ? { ...n, readAt: new Date().toISOString() } : n,
      ) ?? prev,
    );
    setCount((c) => Math.max(0, c - 1));
    startTransition(() => {
      markAsRead(id).catch(() => refreshCount());
    });
  };

  const handleReadAll = () => {
    const now = new Date().toISOString();
    setItems((prev) => prev?.map((n) => ({ ...n, readAt: n.readAt ?? now })) ?? prev);
    setCount(0);
    startTransition(() => {
      markAllAsRead().catch(() => refreshCount());
    });
  };

  const badge = count > 9 ? "9+" : String(count);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={
            count > 0
              ? `Notificaciones (${count} sin leer)`
              : "Notificaciones"
          }
          className={cn(
            "relative flex h-11 w-11 items-center justify-center rounded-xl text-gray-600 transition-colors hover:bg-brand/10 hover:text-brand dark:text-gray-300 dark:hover:text-brand",
            className,
          )}
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
          {count > 0 && (
            <span
              // aria-hidden: el número ya está en el aria-label del botón; sin
              // esto el lector de pantalla dice "3" suelto después del nombre.
              aria-hidden="true"
              className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold leading-none text-white shadow"
            >
              {badge}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-[calc(100vw-2rem)] max-w-sm p-0 sm:w-96"
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            Notificaciones
          </p>
          {count > 0 && (
            <button
              type="button"
              onClick={handleReadAll}
              disabled={pending}
              className="flex items-center gap-1.5 text-xs font-medium text-brand transition-opacity hover:opacity-80 disabled:opacity-50"
            >
              <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Marcar todas
            </button>
          )}
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {items === null && (
            <div className="flex items-center justify-center py-10">
              <Loader2
                className="h-5 w-5 animate-spin text-gray-400"
                aria-hidden="true"
              />
              <span className="sr-only">Cargando notificaciones</span>
            </div>
          )}

          {items?.length === 0 && (
            <div className="px-4 py-10 text-center">
              <Bell
                className="mx-auto mb-2 h-8 w-8 text-gray-300 dark:text-gray-600"
                aria-hidden="true"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No tenés notificaciones todavía.
              </p>
            </div>
          )}

          {items?.map((item) => (
            <NotificationRow
              key={item.id}
              item={item}
              onRead={handleRead}
              onNavigate={() => setOpen(false)}
            />
          ))}
        </div>

        <div className="border-t border-gray-100 p-2 dark:border-gray-800">
          <Link
            href="/notificaciones"
            onClick={() => setOpen(false)}
            className="block rounded-lg px-3 py-2 text-center text-sm font-medium text-brand transition-colors hover:bg-brand/5"
          >
            Ver todas
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
