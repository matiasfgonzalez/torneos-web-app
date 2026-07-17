import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { checkUser } from "@/lib/checkUser";
import { isEmailEnabled } from "@/lib/notifications";
import { getMyNotifications } from "@modules/notificaciones/actions/notifications";
import { getMyNotificationPreferences } from "@modules/notificaciones/actions/preferences";
import { NotificationList } from "@modules/notificaciones/components/NotificationList";
import { NotificationPreferences } from "@modules/notificaciones/components/NotificationPreferences";

export const metadata: Metadata = {
  title: "Notificaciones | GOLAZO",
  description: "Tus avisos de GOLAZO y tus preferencias de email.",
};

/** Son datos de la sesión: nunca se cachean entre usuarios. */
export const dynamic = "force-dynamic";

/**
 * /notificaciones (S5) — el historial completo, más las preferencias.
 *
 * Las preferencias viven acá y no en /profile a propósito: el usuario llega
 * desde la campana ("¿por qué me llega esto?") y quiere apagarlo en el mismo
 * lugar donde lo está viendo.
 */
export default async function NotificacionesPage() {
  const user = await checkUser();
  if (!user) redirect("/sign-in");

  const [items, preferences] = await Promise.all([
    getMyNotifications(50),
    getMyNotificationPreferences(),
  ]);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Notificaciones
        </h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Todo lo que pasó con tus equipos, tus torneos y tu ficha.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start">
        <NotificationList initial={items} />

        <aside className="lg:sticky lg:top-24">
          <NotificationPreferences
            initial={preferences}
            emailEnabled={isEmailEnabled()}
          />
        </aside>
      </div>
    </main>
  );
}
