"use client";

import Link from "next/link";
import type { NotificationCategory } from "@prisma/client";
import { CircleDollarSign, IdCard, ShieldCheck, Trophy } from "lucide-react";

import { cn } from "@/lib/utils";
import { relativeTime } from "@modules/notificaciones/lib/relativeTime";
import type { NotificationItem } from "@modules/notificaciones/types";

/** Ícono por categoría: se reconoce el tipo antes de leer el texto. */
const CATEGORY_ICON: Record<
  NotificationCategory,
  { Icon: typeof Trophy; className: string }
> = {
  EQUIPO: { Icon: ShieldCheck, className: "text-blue-600 bg-blue-500/10" },
  PARTIDO: { Icon: Trophy, className: "text-brand bg-brand/10" },
  PAGO: { Icon: CircleDollarSign, className: "text-amber-600 bg-amber-500/10" },
  FICHA: { Icon: IdCard, className: "text-violet-600 bg-violet-500/10" },
};

interface NotificationRowProps {
  item: NotificationItem;
  onRead: (id: string) => void;
  onNavigate?: () => void;
}

/**
 * Una fila de la campana y de la página (S5) — la misma en los dos lados, así
 * no se despegan.
 *
 * Sin `url` la fila **no es un link**: se renderiza como `<div>`. Un `<a>` sin
 * destino es focusable y no hace nada, que es exactamente lo que rompe la
 * navegación por teclado.
 */
export function NotificationRow({
  item,
  onRead,
  onNavigate,
}: Readonly<NotificationRowProps>) {
  const unread = !item.readAt;
  const { Icon, className: iconClass } = CATEGORY_ICON[item.category];

  const content = (
    <>
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          iconClass,
        )}
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>

      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block text-sm leading-snug text-gray-900 dark:text-white",
            unread ? "font-semibold" : "font-normal",
          )}
        >
          {item.title}
        </span>
        {item.body && (
          <span className="mt-0.5 block text-xs leading-relaxed text-gray-500 dark:text-gray-400">
            {item.body}
          </span>
        )}
        <span className="mt-1 block text-[11px] text-gray-400 dark:text-gray-500">
          {relativeTime(item.createdAt)}
        </span>
      </span>

      {unread && (
        <span
          aria-hidden="true"
          className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand"
        />
      )}
    </>
  );

  const rowClass = cn(
    "flex w-full gap-3 px-4 py-3 text-left transition-colors",
    unread ? "bg-brand/[0.03]" : "",
  );

  if (!item.url) {
    return (
      <div className={rowClass}>
        {content}
        {unread && (
          <button
            type="button"
            onClick={() => onRead(item.id)}
            className="sr-only focus:not-sr-only"
          >
            Marcar como leída
          </button>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.url}
      onClick={() => {
        if (unread) onRead(item.id);
        onNavigate?.();
      }}
      className={cn(rowClass, "hover:bg-gray-50 dark:hover:bg-gray-800/60")}
    >
      {content}
    </Link>
  );
}
