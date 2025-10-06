"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { GradientButton } from "@/components/ui-dev/gradient-button";
import { GradientText } from "@/components/ui-dev/gradient-text";
import { useMobileMenu } from "@/hooks/use-mobile-menu";
import { navigationLinks } from "@/lib/constants/navigation";
import Link from "next/link";
import { User } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

const Menu = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 6h16M4 12h16M4 18h16"
    />
  </svg>
);

const X = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

interface HeaderProps {
  isLogued?: boolean;
}

export function Header(props: Readonly<HeaderProps>) {
  const { isLogued } = props;
  const { isOpen, toggle, close } = useMobileMenu();

  return (
    <nav className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50 border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center space-x-2">
              {/* You can replace the div below with an actual logo image if available */}
              <div className="w-8 h-8 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] rounded-lg flex items-center justify-center">
                🏆
              </div>
              <span className="text-2xl font-bold">
                {" "}
                <GradientText>GOLAZO</GradientText>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-gray-600 dark:text-gray-300 hover:text-[#ad45ff] dark:hover:text-[#ad45ff] transition-colors"
              >
                {link.label}
              </a>
            ))}
            {/* Authentication Buttons */}
            {isLogued && (
              <Link
                href="/admin/dashboard"
                className="text-gray-600 dark:text-gray-300 hover:text-[#ad45ff] dark:hover:text-[#ad45ff] transition-colors"
              >
                Administración
              </Link>
            )}
            {/* Theme Toggle */}
            <ThemeToggle />
            <SignedOut>
              <SignInButton>
                <GradientButton className="cursor-pointer">
                  <User className="w-5 h-5" />
                  Iniciar sesión
                </GradientButton>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={toggle}
              className="text-gray-600 dark:text-gray-300"
            >
              {isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-gray-200 dark:border-gray-700">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigationLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="block px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-[#ad45ff] dark:hover:text-[#ad45ff] transition-colors"
                  onClick={close}
                >
                  {link.label}
                </a>
              ))}
              {/* Authentication Buttons */}
              {isLogued && (
                <Link
                  href="/admin/dashboard"
                  className="block px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-[#ad45ff] dark:hover:text-[#ad45ff] transition-colors"
                  onClick={close}
                >
                  Administración
                </Link>
              )}
              <div className="px-3 py-2">
                <SignedOut>
                  <SignInButton>
                    <GradientButton className="w-full cursor-pointer">
                      <User className="w-5 h-5" />
                      Iniciar sesión
                    </GradientButton>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <UserButton />
                </SignedIn>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
