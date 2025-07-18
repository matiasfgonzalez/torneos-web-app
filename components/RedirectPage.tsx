"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, ArrowRight, Sparkles } from "lucide-react";

export default function RedirectPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-2xl border-primary/20 bg-card/95 backdrop-blur-sm">
                <CardContent className="p-8 text-center space-y-6">
                    {/* Logo y título */}
                    <div className="space-y-4">
                        <div className="flex justify-center">
                            <div className="relative">
                                <Trophy className="h-16 w-16 text-primary animate-pulse" />
                                <Sparkles className="h-6 w-6 text-primary/60 absolute -top-1 -right-1 animate-bounce" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold text-foreground">
                                ¡Bienvenido!
                            </h1>
                            <p className="text-lg text-primary font-semibold">
                                Matute Deportes
                            </p>
                            <p className="text-muted-foreground">
                                Tu plataforma de gestión deportiva te está
                                esperando
                            </p>
                        </div>
                    </div>

                    {/* Botón principal */}
                    <div className="space-y-4">
                        <Button
                            asChild
                            size="lg"
                            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        >
                            <Link
                                href="/index"
                                className="flex items-center justify-center gap-3"
                            >
                                <span>INGRESAR</span>
                                <ArrowRight className="h-6 w-6 animate-pulse" />
                            </Link>
                        </Button>

                        <p className="text-sm text-muted-foreground">
                            Accede a todos los torneos, estadísticas y noticias
                        </p>
                    </div>

                    {/* Características destacadas */}
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-primary/10">
                        <div className="text-center space-y-1">
                            <div className="text-2xl font-bold text-primary">
                                15+
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Torneos
                            </div>
                        </div>
                        <div className="text-center space-y-1">
                            <div className="text-2xl font-bold text-primary">
                                248
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Equipos
                            </div>
                        </div>
                        <div className="text-center space-y-1">
                            <div className="text-2xl font-bold text-primary">
                                1.2K
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Partidos
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Efectos de fondo */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>
        </div>
    );
}
