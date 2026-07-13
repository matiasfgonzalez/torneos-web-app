"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Trophy,
  Users,
  Users2,
  UserCheck,
  Calendar,
  BarChart3,
  Settings,
  Menu,
  Home,
  Shield,
  Newspaper,
  ArrowLeft,
  Info,
  CreditCard,
  Wallet,
  UsersRound,
  Building2,
  Layers,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Roles de PLATAFORMA (N1): ADMINISTRADOR | USUARIO.
// El acceso fino por organización lo validan los layouts/APIs;
// acá USUARIO = miembro de organización con acceso al panel.
const menuItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: Home,
    enabled: true,
    roles: ["ADMINISTRADOR", "USUARIO"],
  },
  {
    title: "Noticias",
    href: "/admin/noticias",
    icon: Newspaper,
    enabled: true,
    roles: ["ADMINISTRADOR"],
  },
  {
    title: "Torneos",
    href: "/admin/torneos",
    icon: Trophy,
    enabled: true,
    roles: ["ADMINISTRADOR", "USUARIO"],
  },
  {
    title: "Equipos",
    href: "/admin/equipos",
    icon: Users,
    enabled: true,
    roles: ["ADMINISTRADOR", "USUARIO"],
  },
  {
    title: "Jugadores",
    href: "/admin/jugadores",
    icon: UserCheck,
    enabled: true,
    roles: ["ADMINISTRADOR", "USUARIO"],
  },
  {
    title: "Árbitros",
    href: "/admin/arbitros",
    icon: Shield,
    enabled: true,
    roles: ["ADMINISTRADOR", "USUARIO"],
  },
  {
    title: "Partidos",
    href: "/admin/partidos",
    icon: Calendar,
    enabled: true,
    roles: ["ADMINISTRADOR", "USUARIO"],
  },
  {
    title: "Miembros",
    href: "/admin/miembros",
    icon: UsersRound,
    enabled: true,
    roles: ["ADMINISTRADOR", "USUARIO"],
  },
  {
    title: "Plan y Pagos",
    href: "/admin/plan",
    icon: CreditCard,
    enabled: true,
    roles: ["ADMINISTRADOR", "USUARIO"],
  },
  {
    title: "Usuarios",
    href: "/admin/usuarios",
    icon: Users2,
    enabled: true,
    roles: ["ADMINISTRADOR"],
  },
  {
    title: "Organizaciones",
    href: "/admin/organizaciones",
    icon: Building2,
    enabled: true,
    roles: ["ADMINISTRADOR"],
  },
  {
    title: "Planes",
    href: "/admin/planes",
    icon: Layers,
    enabled: true,
    roles: ["ADMINISTRADOR"],
  },
  {
    title: "Aprobar Pagos",
    href: "/admin/pagos",
    icon: Wallet,
    enabled: true,
    roles: ["ADMINISTRADOR"],
  },
  {
    title: "Estadísticas",
    href: "/admin/estadisticas",
    icon: BarChart3,
    enabled: false,
    roles: ["ADMINISTRADOR"],
  },
  {
    title: "Configuración",
    href: "/admin/configuracion",
    icon: Settings,
    enabled: true,
    roles: ["ADMINISTRADOR"],
  },
];

interface AdminSidebarProps {
  role: string | null;
  /** Sidebar colapsado a solo íconos (desktop). Lo gobierna AdminShell. */
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}

/**
 * Sidebar del panel (F3). En desktop se puede **replegar a solo íconos**
 * (el estado lo persiste AdminShell en localStorage); en mobile abre en un
 * `Sheet` lateral. La sección activa se marca por prefijo de ruta, así que
 * las subpáginas (`/admin/torneos/[id]`) mantienen "Torneos" resaltado.
 */
export function AdminSidebar({
  role,
  collapsed = false,
  onToggleCollapsed,
}: Readonly<AdminSidebarProps>) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const visibleItems = menuItems.filter((item) =>
    item.roles.includes(role ?? "viewer"),
  );

  return (
    <>
      {/* Desktop: fijo, replegable a solo íconos */}
      <div
        className={cn(
          "hidden md:flex md:flex-col md:fixed md:inset-y-0 z-40 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 shadow-lg transition-[width] duration-300",
          collapsed ? "md:w-20" : "md:w-72",
        )}
      >
        <SidebarContent
          items={visibleItems}
          pathname={pathname}
          role={role}
          iconsOnly={collapsed}
          onNavigate={() => setOpen(false)}
        />

        {/* Toggle: pestaña sobre el borde derecho del sidebar */}
        {onToggleCollapsed && (
          <button
            type="button"
            onClick={onToggleCollapsed}
            aria-expanded={!collapsed}
            aria-label={collapsed ? "Expandir menú" : "Contraer menú"}
            title={collapsed ? "Expandir menú" : "Contraer menú"}
            className="absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-11 flex items-center justify-center rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md text-gray-500 hover:text-brand hover:border-brand/50 transition-colors"
          >
            {collapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Mobile: Sheet lateral (siempre con texto) */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Abrir menú"
              className="h-11 w-11 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-sm"
            >
              <Menu className="h-5 w-5 text-gray-700 dark:text-gray-200" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="p-0 w-72 z-50 h-full overflow-hidden"
          >
            <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
            <SheetDescription className="sr-only">
              Panel de administración - Navegación principal
            </SheetDescription>
            <div className="h-full overflow-y-auto">
              <SidebarContent
                items={visibleItems}
                pathname={pathname}
                role={role}
                onNavigate={() => setOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

interface SidebarContentProps {
  items: typeof menuItems;
  pathname: string;
  role: string | null;
  /** Solo íconos: aplica al sidebar fijo de desktop, nunca al Sheet mobile. */
  iconsOnly?: boolean;
  onNavigate: () => void;
}

/** Definido a nivel de módulo (no dentro de AdminSidebar): crearlo en cada
    render remontaría el árbol entero del sidebar en cada navegación. */
function SidebarContent({
  items,
  pathname,
  role,
  iconsOnly = false,
  onNavigate,
}: Readonly<SidebarContentProps>) {
  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      {/* Header */}
      <div
        className={cn(
          "flex h-20 items-center border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-brand/5 to-brand-2/5 dark:from-brand/10 dark:to-brand-2/10 shrink-0",
          iconsOnly ? "justify-center px-2" : "px-6",
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <div className="w-10 h-10 bg-gradient-to-r from-brand to-brand-2 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full motion-safe:animate-pulse" />
          </div>
          {!iconsOnly && (
            <div className="min-w-0">
              <span className="text-xl font-bold bg-gradient-to-r from-brand to-brand-2 bg-clip-text text-transparent">
                GOLAZO
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                Panel Administrativo
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navegación */}
      <div className="flex-1 overflow-y-auto">
        <nav
          aria-label="Navegación del panel"
          className={cn("space-y-1 py-6", iconsOnly ? "px-2" : "px-6")}
        >
          {!iconsOnly && (
            <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
              Navegación Principal
            </h3>
          )}

          {items.map((item) => {
            // Por prefijo: las subpáginas mantienen su sección resaltada
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            if (!item.enabled) {
              return (
                <div
                  key={item.href}
                  title={`${item.title} (próximamente)`}
                  className={cn(
                    "relative w-full flex items-center gap-4 py-3.5 rounded-xl text-gray-400 cursor-not-allowed opacity-60",
                    iconsOnly ? "justify-center px-2" : "px-4",
                  )}
                >
                  <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 shrink-0">
                    <Icon className="h-4 w-4 text-gray-400" />
                  </div>
                  {!iconsOnly && (
                    <>
                      <span className="font-medium text-gray-400">
                        {item.title}
                      </span>
                      <span className="ml-auto text-yellow-700 dark:text-yellow-400">
                        <Info className="h-4 w-4" />
                        <span className="sr-only">Próximamente</span>
                      </span>
                    </>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={isActive ? "page" : undefined}
                title={iconsOnly ? item.title : undefined}
                className={cn(
                  "group relative w-full flex items-center gap-4 py-3.5 rounded-xl border transition-all duration-300",
                  iconsOnly ? "justify-center px-2" : "px-4",
                  isActive
                    ? "bg-gradient-to-r from-brand/10 to-brand-2/10 border-brand/20 text-brand shadow-md"
                    : "border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-700",
                )}
              >
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-brand to-brand-2 rounded-r-full"
                  />
                )}

                <div
                  className={cn(
                    "p-2 rounded-lg transition-all duration-300 shrink-0",
                    isActive
                      ? "bg-gradient-to-r from-brand to-brand-2 shadow-lg"
                      : "bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 transition-colors duration-300",
                      isActive
                        ? "text-white"
                        : "text-gray-600 dark:text-gray-300",
                    )}
                  />
                </div>

                {!iconsOnly && (
                  <span className="font-medium">{item.title}</span>
                )}
                {iconsOnly && <span className="sr-only">{item.title}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div
        className={cn(
          "border-t border-gray-200 dark:border-gray-700 py-6 shrink-0",
          iconsOnly ? "px-2" : "px-6",
        )}
      >
        <div className="space-y-3">
          <Link
            href="/profile"
            title={iconsOnly ? "Ver perfil" : undefined}
            className="block group/profile"
          >
            <div
              className={cn(
                "flex items-center gap-3 p-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm transition-colors",
                iconsOnly && "justify-center p-2",
              )}
            >
              <div className="w-8 h-8 bg-gradient-to-r from-brand to-brand-2 rounded-full flex items-center justify-center shrink-0">
                <span className="text-white text-sm font-semibold">
                  {role?.charAt(0).toUpperCase() ?? "U"}
                </span>
              </div>
              {!iconsOnly && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white capitalize group-hover/profile:text-brand transition-colors">
                    {role?.toLowerCase() ?? "Usuario"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    Ver Perfil
                  </p>
                </div>
              )}
              {iconsOnly && <span className="sr-only">Ver perfil</span>}
            </div>
          </Link>

          <Button
            variant="outline"
            asChild
            title={iconsOnly ? "Volver al sitio" : undefined}
            className={cn(
              "w-full rounded-xl font-medium border-gray-200 dark:border-gray-700",
              iconsOnly && "px-0",
            )}
          >
            <Link href="/">
              <ArrowLeft className="w-4 h-4" />
              {!iconsOnly && "Volver al sitio"}
              {iconsOnly && <span className="sr-only">Volver al sitio</span>}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );

}
