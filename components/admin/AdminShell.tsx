"use client";

import { useCallback, useSyncExternalStore } from "react";
import { Toaster } from "sonner";
import { Search } from "lucide-react";
import { AdminSidebar } from "@/components/admin/sidebar";
import {
  CommandPalette,
  useCommandPalette,
} from "@/components/admin/CommandPalette";
import ThemeToggle from "@/components/ThemeToggle";
import { useIsMounted } from "@/hooks/use-mounted";
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
  /** Rol en la organización (OWNER/ORGANIZADOR/COLABORADOR/null) — N14c. */
  orgRole?: string | null;
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
  orgRole,
  banner,
  children,
}: Readonly<AdminShellProps>) {
  const collapsed = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const { open: paletteOpen, setOpen: setPaletteOpen } = useCommandPalette();

  // El atajo real depende del sistema operativo, y `navigator` no existe en el
  // server: hasta hidratar se muestra el de Windows/Linux (mayoría acá) y no un
  // texto que cambie y rompa la hidratación.
  const mounted = useIsMounted();
  const isMac =
    mounted && /mac|iphone|ipad/i.test(navigator.userAgent.toLowerCase());

  const toggle = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, String(!collapsed));
    window.dispatchEvent(new Event(EVENT));
  }, [collapsed]);

  return (
    <div className="min-h-screen premium-gradient-bg">
      <AdminSidebar
        role={role}
        orgRole={orgRole}
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

          <div className="flex items-center gap-2">
            {/* Disparador visible del palette: un atajo que no se anuncia no
                existe para nadie que no lo conozca de antes. */}
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="flex h-11 items-center gap-2 rounded-xl border border-gray-200 bg-white/80 px-3 text-sm text-gray-500 transition-colors hover:border-brand/50 hover:text-brand md:w-64 md:justify-start dark:border-gray-700 dark:bg-gray-800/80 dark:text-gray-400"
            >
              <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="hidden md:inline">Buscar…</span>
              <span className="sr-only md:hidden">Buscar</span>
              <kbd className="ml-auto hidden rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 font-mono text-[10px] text-gray-500 md:inline dark:border-gray-600 dark:bg-gray-900 dark:text-gray-400">
                {isMac ? "⌘K" : "Ctrl K"}
              </kbd>
            </button>
            <ThemeToggle />
          </div>
        </header>

        <CommandPalette
          role={role}
          orgRole={orgRole}
          open={paletteOpen}
          onOpenChange={setPaletteOpen}
        />

        {banner}

        <main className="p-4 md:p-6">
          {children}
          <Toaster position="top-right" richColors />
        </main>
      </div>
    </div>
  );
}
