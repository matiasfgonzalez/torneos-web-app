"use client";

import { useState } from "react";
import Link from "next/link";
import { Trophy, Menu, X } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

interface ResponsiveHeaderProps {
    currentPage?: string;
}

export default function ResponsiveHeader({
    currentPage = ""
}: ResponsiveHeaderProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const navigationItems = [
        { href: "/", label: "Inicio", key: "inicio", disabled: false },
        { href: "/torneos", label: "Torneos", key: "torneos", disabled: true },
        { href: "/equipos", label: "Equipos", key: "equipos", disabled: true },
        {
            href: "/jugadores",
            label: "Jugadores",
            key: "jugadores",
            disabled: true
        },
        {
            href: "/noticias",
            label: "Noticias",
            key: "noticias",
            disabled: false
        },
        {
            href: "/estadisticas",
            label: "Estadísticas",
            key: "estadisticas",
            disabled: true
        }
    ];

    return (
        <header className="border-b border-primary/20 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4">
                <nav className="flex items-center justify-between">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="flex items-center space-x-2 group"
                    >
                        <Trophy className="h-8 w-8 text-primary animate-neon-pulse group-hover:scale-110 transition-transform duration-300" />
                        <span className="text-2xl font-display font-bold text-neon-glow">
                            VIVA LA MAÑANA
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center space-x-8">
                        {navigationItems.map(
                            (item) =>
                                !item.disabled && (
                                    <Link
                                        key={item.key}
                                        href={item.href}
                                        className={
                                            currentPage === item.key
                                                ? `nav-neon-link-active text-foreground hover:text-primary`
                                                : `nav-neon-link text-foreground hover:text-primary`
                                        }
                                    >
                                        {item.label}
                                    </Link>
                                )
                        )}

                        {/* Clerk user */}
                        <SignedOut>
                            <SignInButton>
                                <button
                                    className="w-full sm:w-auto bg-gradient-to-r from-[oklch(0.75_0.25_250)] via-[oklch(0.6_0.2_250)] to-[oklch(0.3_0.1_250)] 
             hover:from-[oklch(0.8_0.3_250)] hover:via-[oklch(0.65_0.25_250)] hover:to-[oklch(0.4_0.15_250)] 
             text-white sm:px-4 sm:py-2 px-3 py-1 text-sm sm:text-md rounded-md font-medium cursor-pointer"
                                >
                                    Sign In
                                </button>
                            </SignInButton>
                        </SignedOut>

                        <SignedIn>
                            <UserButton />
                        </SignedIn>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={toggleMobileMenu}
                        className="lg:hidden p-2 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/20 hover:shadow-neon-sm transition-all duration-300 group"
                        aria-label="Toggle mobile menu"
                        aria-expanded={isMobileMenuOpen}
                    >
                        {isMobileMenuOpen ? (
                            <X className="h-6 w-6 text-primary group-hover:rotate-90 transition-transform duration-300" />
                        ) : (
                            <Menu className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                        )}
                    </button>
                </nav>

                {/* Mobile Navigation */}
                <div
                    className={`lg:hidden transition-all duration-500 ease-in-out ${
                        isMobileMenuOpen
                            ? "max-h-96 opacity-100 mt-4 translate-y-0"
                            : "max-h-0 opacity-0 -translate-y-4 overflow-hidden"
                    }`}
                >
                    <div className="bg-card/95 backdrop-blur-md rounded-lg border border-primary/20 shadow-neon-md overflow-hidden">
                        <div className="py-2">
                            {navigationItems.map(
                                (item, index) =>
                                    !item.disabled && (
                                        <Link
                                            key={item.key}
                                            href={item.href}
                                            className={`
                    block px-6 py-4 transition-all duration-300 relative group
                    ${
                        currentPage === item.key
                            ? "text-primary font-semibold bg-primary/10 border-l-4 border-primary shadow-neon-sm"
                            : "text-foreground hover:text-primary hover:bg-primary/5 hover:shadow-neon-sm"
                    }
                  `}
                                            onClick={() =>
                                                setIsMobileMenuOpen(false)
                                            }
                                            style={{
                                                animationDelay: `${
                                                    index * 50
                                                }ms`
                                            }}
                                        >
                                            <span className="relative z-10">
                                                {item.label}
                                            </span>
                                            {currentPage !== item.key && (
                                                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                            )}
                                        </Link>
                                    )
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <div
                        className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
                        onClick={() => setIsMobileMenuOpen(false)}
                        aria-hidden="true"
                    />
                )}
            </div>
        </header>
    );
}
