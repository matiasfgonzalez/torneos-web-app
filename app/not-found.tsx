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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Soccer Ball Animation */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div
              className="w-32 h-32 rounded-full bg-white border-4 border-gray-800 relative overflow-hidden animate-spin"
              style={{ animationDuration: "3s" }}
            >
              {/* Soccer ball pattern */}
              <div className="absolute inset-0">
                {/* Pentagon in center */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-gray-800 rounded-sm rotate-45"></div>

                {/* Hexagons around */}
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-gray-800 rounded-sm rotate-12"></div>
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-gray-800 rounded-sm rotate-12"></div>
                <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-gray-800 rounded-sm rotate-45"></div>
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-gray-800 rounded-sm rotate-45"></div>

                {/* Lines connecting */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-0.5 bg-gray-800 rotate-45"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-0.5 bg-gray-800 -rotate-45"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0.5 h-16 bg-gray-800"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-0.5 bg-gray-800"></div>
              </div>
            </div>

            {/* Shadow */}
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-gray-400 rounded-full opacity-30 blur-sm"></div>
          </div>
        </div>

        {/* Error Message */}
        <Card className="mb-8 border-2 border-green-200 shadow-lg">
          <CardContent className="p-8">
            <div className="mb-6">
              <h1 className="text-6xl font-bold text-gray-800 mb-2">404</h1>
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                ¡Gol perdido!
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                Parece que la página que buscas se fue fuera del campo.
                <br />
                No te preocupes, podemos ayudarte a volver al juego.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">0</div>
                <div className="text-sm text-gray-600">Páginas encontradas</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">1</div>
                <div className="text-sm text-gray-600">Error detectado</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">∞</div>
                <div className="text-sm text-gray-600">Posibilidades</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">100%</div>
                <div className="text-sm text-gray-600">
                  Solución garantizada
                </div>
              </div>
            </div>

            {/* Navigation Options */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild className="bg-green-600 hover:bg-green-700">
                  <Link href="/" className="flex items-center gap-2">
                    <Home className="w-4 h-4" />
                    Volver al Inicio
                  </Link>
                </Button>
                <Button
                  onClick={handleGoBack}
                  variant="outline"
                  className="border-green-600 text-green-600 hover:bg-green-50 bg-transparent flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Página Anterior
                </Button>
              </div>

              {/* Quick Links */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-3">
                  O explora estas secciones:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:text-green-600 hover:bg-green-50"
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
                    className="text-gray-600 hover:text-green-600 hover:bg-green-50"
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
                    className="text-gray-600 hover:text-green-600 hover:bg-green-50"
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
                    className="text-gray-600 hover:text-green-600 hover:bg-green-50"
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
        <div className="text-center text-gray-500 text-sm">
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
