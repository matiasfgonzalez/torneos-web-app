"use client";

import { useCallback, useSyncExternalStore } from "react";
import { Toaster } from "sonner";
import { AdminSidebar } from "@/components/admin/sidebar";
import ThemeToggle from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "golazo:admin-sidebar-collapsed";
const EVENT = "golazo:sidebar-change";

// La preferencia del sidebar vive en localStorage (store externo a React), así
// que se lee con useSyncExternalStore: leerla en un useEffect + setState
// dispara un render en cascada (react-hooks/set-state-in-effect).
function subscribe(onChange: () => void) {
  // `storage` cubre otras pestañas; el evento propio, esta misma pestaña.
  window.addEventListener("storage", onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

const getSnapshot = () => localStorage.getItem(STORAGE_KEY) === "true";
/** En el server no hay localStorage: se asume expandido (el caso más común). */
const getServerSnapshot = () => false;

interface AdminShellProps {
  role: string | null;
  /** Banner de "ver como organización" (N3), renderizado en el server */
  banner?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Caparazón del panel (F3): coordina el sidebar replegable con el ancho del
 * contenido. Es client porque el colapso es interacción del usuario y se
 * persiste entre navegaciones y sesiones.
 *
 * El layout (server) sigue resolviendo auth/rol/orgView y le pasa el árbol.
 */
export function AdminShell({
  role,
  banner,
  children,
}: Readonly<AdminShellProps>) {
  const collapsed = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const toggle = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, String(!collapsed));
    window.dispatchEvent(new Event(EVENT));
  }, [collapsed]);

  return (
    <div className="min-h-screen premium-gradient-bg">
      <AdminSidebar
        role={role}
        collapsed={collapsed}
        onToggleCollapsed={toggle}
      />

      <div
        className={cn(
          "transition-[padding] duration-300",
          collapsed ? "md:pl-20" : "md:pl-72",
        )}
      >
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between glass-header shadow-sm px-4 md:px-6">
          {/* pl-14 en mobile: deja lugar al botón de menú, que es fixed */}
          <div className="flex items-center gap-3 pl-14 md:pl-0">
            <div className="hidden md:flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-brand to-brand-2 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white text-sm font-bold">G</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                  Panel de Administración
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  GOLAZO Admin
                </p>
              </div>
            </div>
            <h1 className="md:hidden text-lg font-bold text-gray-900 dark:text-white">
              Admin
            </h1>
          </div>

          <ThemeToggle />
        </header>

        {banner}

        <main className="p-4 md:p-6">
          {children}
          <Toaster position="top-right" richColors />
        </main>
      </div>
    </div>
  );
}
