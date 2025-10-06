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
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: Home,
    enabled: true,
    roles: ["admin", "editor", "viewer"],
  },
  {
    title: "Noticias",
    href: "/admin/noticias",
    icon: Newspaper,
    enabled: true,
    roles: ["admin", "editor"],
  },
  {
    title: "Torneos",
    href: "/admin/torneos",
    icon: Trophy,
    enabled: true,
    roles: ["admin", "editor"],
  },
  {
    title: "Equipos",
    href: "/admin/equipos",
    icon: Users,
    enabled: true,
  },
  {
    title: "Jugadores",
    href: "/admin/jugadores",
    icon: UserCheck,
    enabled: true,
  },
  {
    title: "Partidos",
    href: "/admin/partidos",
    icon: Calendar,
    enabled: false,
  },
  {
    title: "Estadísticas",
    href: "/admin/estadisticas",
    icon: BarChart3,
    enabled: false,
  },
  {
    title: "Configuración",
    href: "/admin/configuracion",
    icon: Settings,
    enabled: false,
  },
];

interface AdminSidebarProps {
  role: string | null;
}

export function AdminSidebar(props: Readonly<AdminSidebarProps>) {
  const { role } = props;
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      {/* Header mejorado */}
      <div className="flex h-20 items-center border-b border-gray-200 dark:border-gray-700 px-6 bg-gradient-to-r from-[#ad45ff]/5 to-[#a3b3ff]/5 dark:from-[#ad45ff]/10 dark:to-[#a3b3ff]/10 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full animate-pulse"></div>
          </div>
          <div>
            <span className="text-xl font-bold bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] bg-clip-text text-transparent">
              GOLAZO
            </span>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Panel Administrativo
            </p>
          </div>
        </div>
      </div>

      {/* Navigation mejorada con scroll */}
      <div className="flex-1 overflow-y-auto">
        <nav className="space-y-1 p-6">
          <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
            Navegación Principal
          </h3>
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const isDisabled =
              item.roles && !item.roles.includes(role ?? "viewer");

            if (isDisabled) {
              return null; // Skip rendering disabled items
            }

            const html = item.enabled ? (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`group relative w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-[#ad45ff]/10 to-[#a3b3ff]/10 border border-[#ad45ff]/20 text-[#ad45ff] shadow-md"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 border border-transparent hover:border-gray-200 hover:shadow-sm"
                }`}
              >
                {/* Indicador de tab activo */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-[#ad45ff] to-[#a3b3ff] rounded-r-full"></div>
                )}

                <div
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] shadow-lg"
                      : "bg-gray-100 group-hover:bg-gray-200"
                  }`}
                >
                  <item.icon
                    className={`h-4 w-4 transition-colors duration-300 ${
                      isActive
                        ? "text-white"
                        : "text-gray-600 group-hover:text-gray-700"
                    }`}
                  />
                </div>

                <span
                  className={`font-medium transition-colors duration-300 ${
                    isActive
                      ? "text-[#ad45ff]"
                      : "text-gray-700 group-hover:text-gray-900"
                  }`}
                >
                  {item.title}
                </span>

                {!item.enabled && (
                  <span className="ml-auto px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full font-medium">
                    <Info className="h-4 w-4" />
                  </span>
                )}
              </Link>
            ) : (
              <div
                key={item.href}
                className="group relative w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-gray-400 cursor-not-allowed opacity-60"
              >
                <div className="p-2 rounded-lg bg-gray-50">
                  <item.icon className="h-4 w-4 text-gray-400" />
                </div>
                <span className="font-medium text-gray-400">{item.title}</span>
                <span className="ml-auto px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full font-medium">
                  <Info className="h-4 w-4" />
                </span>
              </div>
            );

            return html;
          })}
        </nav>
      </div>

      {/* Footer mejorado */}
      <div className="border-t border-gray-200 p-6 bg-gradient-to-r from-gray-50/50 to-white/50 flex-shrink-0">
        <div className="space-y-3">
          {/* Info del usuario */}
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold">
                {role?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 capitalize">
                {role || "Usuario"}
              </p>
              <p className="text-xs text-gray-500 truncate">Administrador</p>
            </div>
          </div>

          {/* Botón de volver */}
          <Button
            variant="outline"
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-orange-500 py-3 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            asChild
          >
            <Link href="/">
              <ArrowLeft className="w-4 h-4" />
              Volver al sitio
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-40 bg-white border-r border-gray-200 shadow-lg">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar - Button fijo en header */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="p-2 h-9 w-9 hover:bg-gray-100 bg-white/80 backdrop-blur-sm border border-gray-200 shadow-sm"
            >
              <Menu className="h-5 w-5 text-gray-700" />
              <span className="sr-only">Abrir menú</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="p-0 w-72 bg-white z-50 h-full overflow-hidden"
          >
            <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
            <SheetDescription className="sr-only">
              Panel de administración - Navegación principal
            </SheetDescription>
            <div className="h-full overflow-y-auto">
              <SidebarContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
