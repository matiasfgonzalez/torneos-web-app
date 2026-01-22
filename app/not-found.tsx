"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Home,
  ArrowLeft,
  Trophy,
  Users,
  Calendar,
  BarChart3,
} from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  const handleGoBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Soccer Ball Animation */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div
              className="w-32 h-32 rounded-full bg-white dark:bg-gray-100 border-4 border-gray-800 dark:border-gray-700 relative overflow-hidden animate-spin"
              style={{ animationDuration: "3s" }}
            >
              {/* Soccer ball pattern */}
              <div className="absolute inset-0">
                {/* Pentagon in center */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-gray-800 dark:bg-gray-700 rounded-sm rotate-45"></div>

                {/* Hexagons around */}
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-gray-800 dark:bg-gray-700 rounded-sm rotate-12"></div>
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-gray-800 dark:bg-gray-700 rounded-sm rotate-12"></div>
                <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-gray-800 dark:bg-gray-700 rounded-sm rotate-45"></div>
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-gray-800 dark:bg-gray-700 rounded-sm rotate-45"></div>

                {/* Lines connecting */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-0.5 bg-gray-800 dark:bg-gray-700 rotate-45"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-0.5 bg-gray-800 dark:bg-gray-700 -rotate-45"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0.5 h-16 bg-gray-800 dark:bg-gray-700"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-0.5 bg-gray-800 dark:bg-gray-700"></div>
              </div>
            </div>

            {/* Shadow */}
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-gray-400 dark:bg-gray-600 rounded-full opacity-30 blur-sm"></div>
          </div>
        </div>

        {/* Error Message */}
        <Card className="mb-8 border-2 border-green-200 dark:border-[#ad45ff]/30 shadow-lg bg-white dark:bg-gray-800/95 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="mb-6">
              <h1 className="text-6xl font-bold text-gray-800 dark:text-white mb-2">
                404
              </h1>
              <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
                ¡Gol perdido!
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                Parece que la página que buscas se fue fuera del campo.
                <br />
                No te preocupes, podemos ayudarte a volver al juego.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  0
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Páginas encontradas
                </div>
              </div>
              <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  1
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Error detectado
                </div>
              </div>
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  ∞
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Posibilidades
                </div>
              </div>
              <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  100%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Solución garantizada
                </div>
              </div>
            </div>

            {/* Navigation Options */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  asChild
                  className="bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] dark:from-[#8b39cc] dark:to-[#829bd9] hover:from-[#9c3ee6] hover:to-[#92a6ff] dark:hover:from-[#7a32b8] dark:hover:to-[#7189c5] text-white"
                >
                  <Link href="/" className="flex items-center gap-2">
                    <Home className="w-4 h-4" />
                    Volver al Inicio
                  </Link>
                </Button>
                <Button
                  onClick={handleGoBack}
                  variant="outline"
                  className="border-[#ad45ff] dark:border-[#8b39cc] text-[#ad45ff] dark:text-[#a3b3ff] hover:bg-[#ad45ff]/10 dark:hover:bg-[#8b39cc]/20 bg-transparent flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Página Anterior
                </Button>
              </div>

              {/* Quick Links */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  O explora estas secciones:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 dark:text-gray-400 hover:text-[#ad45ff] dark:hover:text-[#a3b3ff] hover:bg-[#ad45ff]/10 dark:hover:bg-[#8b39cc]/20"
                  >
                    <Link href="/torneos" className="flex items-center gap-2">
                      <Trophy className="w-4 h-4" />
                      Torneos
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 dark:text-gray-400 hover:text-[#ad45ff] dark:hover:text-[#a3b3ff] hover:bg-[#ad45ff]/10 dark:hover:bg-[#8b39cc]/20"
                  >
                    <Link href="/equipos" className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Equipos
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 dark:text-gray-400 hover:text-[#ad45ff] dark:hover:text-[#a3b3ff] hover:bg-[#ad45ff]/10 dark:hover:bg-[#8b39cc]/20"
                  >
                    <Link href="/noticias" className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Noticias
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 dark:text-gray-400 hover:text-[#ad45ff] dark:hover:text-[#a3b3ff] hover:bg-[#ad45ff]/10 dark:hover:bg-[#8b39cc]/20"
                  >
                    <Link
                      href="/estadisticas"
                      className="flex items-center gap-2"
                    >
                      <BarChart3 className="w-4 h-4" />
                      Estadísticas
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Message */}
        <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>
            Si crees que esto es un error, contacta al administrador del torneo.
          </p>
          <p className="mt-1">
            ¡Gracias por tu paciencia y que siga el juego! ⚽
          </p>
        </div>
      </div>
    </div>
  );
}

