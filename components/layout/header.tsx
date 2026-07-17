"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { GradientButton } from "@/components/ui-dev/gradient-button";
import { GradientText } from "@/components/ui-dev/gradient-text";
import { useMobileMenu } from "@/hooks/use-mobile-menu";
import { siteLinks, anonLinks } from "@/lib/constants/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { User, Menu, X, ChevronRight, Trophy } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

interface HeaderProps {
  isLogued?: boolean;
  /**
   * Links del usuario según sus sombreros reales (N14a) — los calcula el
   * server con `getUserNavLinks()`. Sin este prop, un logueado cae al par
   * histórico "Mi Panel"/"Mi Perfil" (mentía para hinchas y delegados).
   */
  userLinks?: { href: string; label: string }[];
}

/**
 * Header público unificado (F2): mismas secciones en todas las páginas
 * (antes la landing mostraba anclas que desaparecían al navegar), indicador
 * de sección activa por ruta, mobile-first y dark/light.
 */
export function Header(props: Readonly<HeaderProps>) {
  const { isLogued, userLinks } = props;
  const { isOpen, toggle, close } = useMobileMenu();
  const pathname = usePathname();

  // Links de secciones + extras según sesión (una sola fuente para
  // desktop y mobile — nunca más menús distintos por página)
  const links: { href: string; label: string }[] = [
    ...siteLinks,
    ...(isLogued
      ? (userLinks ?? [
          { href: "/admin/dashboard", label: "Mi Panel" },
          { href: "/profile", label: "Mi Perfil" },
        ])
      : [...anonLinks]),
  ];

  const isActive = (href: string) =>
    !href.includes("#") &&
    (pathname === href || pathname.startsWith(`${href}/`));

  return (
    <header className="sticky top-0 z-50">
      {/* Barra superior decorativa con gradiente */}
      <div className="h-1 bg-gradient-to-r from-brand via-brand-2 to-brand" />

      <nav className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800">
        {/* Efecto de brillo sutil */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand/5 via-transparent to-brand-2/5 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            {/* Logo Premium */}
            <Link href="/" className="group flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-brand to-brand-2 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative w-10 h-10 bg-gradient-to-br from-brand to-brand-2 rounded-xl flex items-center justify-center shadow-lg shadow-brand/25 group-hover:shadow-brand/40 transition-all group-hover:scale-105">
                  <Trophy className="w-5 h-5 text-white" aria-hidden="true" />
                </div>
              </div>
              <GradientText className="text-2xl font-bold tracking-tight">
                GOLAZO
              </GradientText>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {links.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative px-4 py-2 text-sm font-medium transition-colors rounded-lg group",
                      active
                        ? "text-brand"
                        : "text-gray-600 dark:text-gray-300 hover:text-brand dark:hover:text-brand hover:bg-brand/5",
                    )}
                  >
                    {link.label}
                    <span
                      className={cn(
                        "absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-gradient-to-r from-brand to-brand-2 transition-all duration-300 rounded-full",
                        active ? "w-3/4" : "w-0 group-hover:w-3/4",
                      )}
                    />
                  </Link>
                );
              })}
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-4">
              <ThemeToggle />
              <SignedOut>
                <SignInButton>
                  <GradientButton className="cursor-pointer shadow-lg shadow-brand/25 hover:shadow-brand/40 transition-all">
                    <User className="w-4 h-4" />
                    Iniciar sesión
                  </GradientButton>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-brand/20 to-brand-2/20 hover:from-brand/30 hover:to-brand-2/30 transition-all">
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: "w-8 h-8",
                      },
                    }}
                  />
                </div>
              </SignedIn>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center gap-3">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={toggle}
                aria-expanded={isOpen}
                aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
                className="relative w-11 h-11 p-0 text-gray-600 dark:text-gray-300 hover:bg-brand/10 rounded-xl transition-colors"
              >
                {isOpen ? (
                  <X className="w-5 h-5" aria-hidden="true" />
                ) : (
                  <Menu className="w-5 h-5" aria-hidden="true" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation - Panel deslizable con scroll */}
        <div
          className={`lg:hidden absolute top-full left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 shadow-xl shadow-black/5 transition-all duration-300 ease-out max-h-[calc(100vh-5rem)] overflow-y-auto ${
            isOpen
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-4 pointer-events-none"
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            {links.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 rounded-xl transition-all group",
                    active
                      ? "text-brand bg-brand/5 dark:bg-brand/10"
                      : "text-gray-700 dark:text-gray-200 hover:text-brand dark:hover:text-brand hover:bg-brand/5",
                  )}
                  onClick={close}
                >
                  <span className="font-medium text-sm">{link.label}</span>
                  <ChevronRight
                    className={cn(
                      "w-4 h-4 transition-all",
                      active
                        ? "text-brand"
                        : "text-gray-400 group-hover:text-brand group-hover:translate-x-1",
                    )}
                    aria-hidden="true"
                  />
                </Link>
              );
            })}

            {/* Auth section mobile */}
            <div className="pt-3 mt-3 border-t border-gray-100 dark:border-gray-800">
              <SignedOut>
                <SignInButton>
                  <GradientButton className="w-full cursor-pointer shadow-lg shadow-brand/25 py-3">
                    <User className="w-4 h-4" />
                    Iniciar sesión
                  </GradientButton>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <div className="flex items-center gap-4 px-4 py-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <div className="flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-r from-brand/20 to-brand-2/20">
                    <UserButton
                      appearance={{
                        elements: {
                          avatarBox: "w-9 h-9",
                        },
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Mi cuenta
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Gestionar perfil
                    </p>
                  </div>
                </div>
              </SignedIn>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
