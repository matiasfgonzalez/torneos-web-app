"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { GradientButton } from "@/components/ui-dev/gradient-button";
import { GradientText } from "@/components/ui-dev/gradient-text";
import { useMobileMenu } from "@/hooks/use-mobile-menu";
import { navigationLinks } from "@/lib/constants/navigation";
import Link from "next/link";
import { User, Menu, X, ChevronRight } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

interface HeaderProps {
  isLogued?: boolean;
}

export function Header(props: Readonly<HeaderProps>) {
  const { isLogued } = props;
  const { isOpen, toggle, close } = useMobileMenu();

  return (
    <header className="sticky top-0 z-50">
      {/* Barra superior decorativa con gradiente */}
      <div className="h-1 bg-gradient-to-r from-[#ad45ff] via-[#a3b3ff] to-[#ad45ff]" />

      <nav className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800">
        {/* Efecto de brillo sutil */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#ad45ff]/5 via-transparent to-[#a3b3ff]/5 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            {/* Logo Premium */}
            <Link href="/" className="group flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative w-10 h-10 bg-gradient-to-br from-[#ad45ff] to-[#a3b3ff] rounded-xl flex items-center justify-center shadow-lg shadow-[#ad45ff]/25 group-hover:shadow-[#ad45ff]/40 transition-all group-hover:scale-105">
                  <span className="text-lg">🏆</span>
                </div>
              </div>
              <GradientText className="text-2xl font-bold tracking-tight">
                GOLAZO
              </GradientText>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navigationLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="relative px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-[#ad45ff] dark:hover:text-[#ad45ff] transition-colors rounded-lg hover:bg-[#ad45ff]/5 group"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] group-hover:w-3/4 transition-all duration-300 rounded-full" />
                </a>
              ))}
              {isLogued && (
                <>
                  <Link
                    href="/admin/dashboard"
                    className="relative px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-[#ad45ff] dark:hover:text-[#ad45ff] transition-colors rounded-lg hover:bg-[#ad45ff]/5 group"
                  >
                    Administración
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] group-hover:w-3/4 transition-all duration-300 rounded-full" />
                  </Link>
                  <Link
                    href="/profile"
                    className="relative px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-[#ad45ff] dark:hover:text-[#ad45ff] transition-colors rounded-lg hover:bg-[#ad45ff]/5 group"
                  >
                    Mi Perfil
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] group-hover:w-3/4 transition-all duration-300 rounded-full" />
                  </Link>
                </>
              )}
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-4">
              <ThemeToggle />
              <SignedOut>
                <SignInButton>
                  <GradientButton className="cursor-pointer shadow-lg shadow-[#ad45ff]/25 hover:shadow-[#ad45ff]/40 transition-all">
                    <User className="w-4 h-4" />
                    Iniciar sesión
                  </GradientButton>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-[#ad45ff]/20 to-[#a3b3ff]/20 hover:from-[#ad45ff]/30 hover:to-[#a3b3ff]/30 transition-all">
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
                className="relative w-10 h-10 p-0 text-gray-600 dark:text-gray-300 hover:bg-[#ad45ff]/10 rounded-xl transition-colors"
              >
                <span className="sr-only">Abrir menú</span>
                {isOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
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
            {navigationLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="flex items-center justify-between px-4 py-2.5 text-gray-700 dark:text-gray-200 hover:text-[#ad45ff] dark:hover:text-[#ad45ff] hover:bg-[#ad45ff]/5 rounded-xl transition-all group"
                onClick={close}
              >
                <span className="font-medium text-sm">{link.label}</span>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#ad45ff] group-hover:translate-x-1 transition-all" />
              </a>
            ))}

            {isLogued && (
              <>
                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent my-4" />
                <Link
                  href="/admin/dashboard"
                  className="flex items-center justify-between px-4 py-2.5 text-gray-700 dark:text-gray-200 hover:text-[#ad45ff] dark:hover:text-[#ad45ff] hover:bg-[#ad45ff]/5 rounded-xl transition-all group"
                  onClick={close}
                >
                  <span className="font-medium text-sm">Administración</span>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#ad45ff] group-hover:translate-x-1 transition-all" />
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center justify-between px-4 py-2.5 text-gray-700 dark:text-gray-200 hover:text-[#ad45ff] dark:hover:text-[#ad45ff] hover:bg-[#ad45ff]/5 rounded-xl transition-all group"
                  onClick={close}
                >
                  <span className="font-medium text-sm">Mi Perfil</span>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#ad45ff] group-hover:translate-x-1 transition-all" />
                </Link>
              </>
            )}

            {/* Auth section mobile */}
            <div className="pt-3 mt-3 border-t border-gray-100 dark:border-gray-800">
              <SignedOut>
                <SignInButton>
                  <GradientButton className="w-full cursor-pointer shadow-lg shadow-[#ad45ff]/25 py-3">
                    <User className="w-4 h-4" />
                    Iniciar sesión
                  </GradientButton>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <div className="flex items-center gap-4 px-4 py-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <div className="flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-r from-[#ad45ff]/20 to-[#a3b3ff]/20">
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
