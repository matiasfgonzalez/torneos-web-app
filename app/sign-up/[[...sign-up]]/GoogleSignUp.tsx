"use client";

import { SignUpButton, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { GradientText } from "@/components/ui-dev/gradient-text";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Trophy,
  Shield,
  CheckCircle,
  Star,
  Users,
  BarChart3,
} from "lucide-react";
import Link from "next/link";

export default function GoogleSignUp() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();

  // Si el usuario ya está logueado, lo redirigimos automáticamente
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/admin/dashboard"); // Redirigir al dashboard
    }
  }, [isLoaded, isSignedIn, router]);

  // Si aún se está cargando Clerk
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] rounded-2xl flex items-center justify-center mx-auto animate-pulse">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <div className="space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#ad45ff] mx-auto" />
            <p className="text-gray-600 font-medium">Iniciando GOLAZO...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg space-y-6 sm:space-y-8">
        {/* Header con branding mejorado */}
        <div className="text-center space-y-4">
          <Link href="/" className="inline-flex items-center space-x-3 group">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200">
              <Trophy className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <div className="text-left">
              <span className="text-xl sm:text-2xl font-bold">
                <GradientText>GOLAZO</GradientText>
              </span>
              <div className="text-xs text-gray-500 font-medium">
                Gestión Profesional
              </div>
            </div>
          </Link>
        </div>

        {/* Tarjeta principal mejorada */}
        <Card className="border-2 border-gray-100 shadow-xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4 pb-4 px-4 sm:px-6">
            <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium mx-auto">
              <Star className="w-4 h-4" />
              <span>Cuenta Gratuita</span>
            </div>

            <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">
              ¡Únete a GOLAZO! 🚀
            </CardTitle>

            <CardDescription className="text-gray-600 text-sm sm:text-base leading-relaxed">
              Crea tu cuenta gratuita y comienza a gestionar tus torneos con
              herramientas profesionales
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 px-4 sm:px-6 pb-6">
            {/* Beneficios destacados */}
            <div className="bg-gradient-to-r from-[#ad45ff]/5 to-[#a3b3ff]/5 rounded-xl p-4 border border-[#ad45ff]/20">
              <h4 className="font-semibold text-gray-900 text-sm mb-3 text-center">
                ✨ Lo que obtienes gratis:
              </h4>
              <div className="grid grid-cols-1 gap-3 text-sm text-gray-700">
                <div className="flex items-center space-x-3">
                  <Trophy className="w-4 h-4 text-[#ad45ff] flex-shrink-0" />
                  <span>Gestión completa de torneos</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="w-4 h-4 text-[#ad45ff] flex-shrink-0" />
                  <span>Administración de equipos y jugadores</span>
                </div>
                <div className="flex items-center space-x-3">
                  <BarChart3 className="w-4 h-4 text-[#ad45ff] flex-shrink-0" />
                  <span>Estadísticas y reportes avanzados</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="w-4 h-4 text-[#ad45ff] flex-shrink-0" />
                  <span>Seguridad y respaldos automáticos</span>
                </div>
              </div>
            </div>

            {/* Botón de Google mejorado */}
            <SignUpButton
              mode="redirect"
              forceRedirectUrl="/admin/dashboard"
              fallbackRedirectUrl="/admin/dashboard"
            >
              <Button
                size="lg"
                className="w-full h-12 sm:h-14 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] hover:from-[#9d35ef] hover:to-[#93a3ef] text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
              >
                <Shield className="w-5 h-5 mr-3" />
                Crear cuenta con Google
              </Button>
            </SignUpButton>

            {/* Seguridad y confianza */}
            <div className="text-center space-y-3 pt-2 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>Sin tarjeta de crédito</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Shield className="w-3 h-3 text-green-500" />
                  <span>Datos seguros</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3 text-green-500" />
                  <span>Configuración rápida</span>
                </div>
              </div>

              <p className="text-xs text-gray-500 leading-relaxed">
                ¿Ya tienes cuenta?{" "}
                <Link
                  href="/sign-in"
                  className="text-[#ad45ff] hover:text-[#9d35ef] font-semibold hover:underline transition-colors"
                >
                  Inicia sesión
                </Link>
              </p>

              <p className="text-xs text-gray-500 leading-relaxed">
                Al registrarte, aceptas nuestros{" "}
                <button
                  type="button"
                  className="text-[#ad45ff] hover:underline font-medium focus:outline-none focus:underline"
                  onClick={() => console.log("Terms clicked")}
                >
                  Términos de Servicio
                </button>{" "}
                y{" "}
                <button
                  type="button"
                  className="text-[#ad45ff] hover:underline font-medium focus:outline-none focus:underline"
                  onClick={() => console.log("Privacy clicked")}
                >
                  Política de Privacidad
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Volver al inicio */}
        <div className="text-center">
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-[#ad45ff] transition-colors font-medium"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
