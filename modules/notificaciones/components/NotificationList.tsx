"use client";

import { useState, useTransition } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  markAllAsRead,
  markAsRead,
} from "@modules/notificaciones/actions/notifications";
import { NotificationRow } from "@modules/notificaciones/components/NotificationRow";
import type { NotificationItem } from "@modules/notificaciones/types";

/**
 * Lista completa de /notificaciones (S5). Recibe la primera página ya
 * resuelta por el server component; a partir de ahí maneja el estado de leído.
 */
export function NotificationList({
  initial,
}: Readonly<{ initial: NotificationItem[] }>) {
  const [items, setItems] = useState(initial);
  const [pending, startTransition] = useTransition();

  const unreadCount = items.filter((n) => !n.readAt).length;

  const handleRead = (id: string) => {
    setItems((prev) =>
      prev.map((n) =>
        n.id === id && !n.readAt ? { ...n, readAt: new Date().toISOString() } : n,
      ),
    );
    startTransition(() => {
      markAsRead(id).catch(() => undefined);
    });
  };

  const handleReadAll = () => {
    const snapshot = items;
    const now = new Date().toISOString();
    setItems((prev) => prev.map((n) => ({ ...n, readAt: n.readAt ?? now })));
    startTransition(async () => {
      const result = await markAllAsRead().catch(() => null);
      if (!result?.ok) {
        // Acá sí se revierte: no hay navegación que tape el error, y dejar todo
        // como leído cuando el server no lo guardó las esconde para siempre.
        setItems(snapshot);
        toast.error("No se pudieron marcar como leídas. Probá de nuevo.");
      }
    });
  };

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center dark:border-gray-700">
        <Bell
          className="mx-auto mb-3 h-10 w-10 text-gray-300 dark:text-gray-600"
          aria-hidden="true"
        />
        <p className="font-medium text-gray-900 dark:text-white">
          No tenés notificaciones
        </p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Acá te avisamos cuando la liga responda tus solicitudes o se carguen
          resultados de tus equipos.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {unreadCount > 0 && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReadAll}
            disabled={pending}
            className="text-brand hover:text-brand"
          >
            <CheckCheck className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Marcar todas como leídas ({unreadCount})
          </Button>
        </div>
      )}

      <div className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200 bg-white dark:divide-gray-800 dark:border-gray-700 dark:bg-gray-900">
        {items.map((item) => (
          <NotificationRow key={item.id} item={item} onRead={handleRead} />
        ))}
      </div>
    </div>
  );
}
