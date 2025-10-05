"use client";

import { useSignIn, useUser } from "@clerk/nextjs";
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
import { Loader2, Trophy, Shield, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function GoogleSignIn() {
  const router = useRouter();
  const { isSignedIn, isLoaded: userLoaded } = useUser();
  const { signIn, isLoaded: signInLoaded } = useSignIn();

  useEffect(() => {
    if (userLoaded && isSignedIn) {
      router.push("/admin/dashboard");
    }
  }, [userLoaded, isSignedIn, router]);

  if (!userLoaded || !signInLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-6 h-6 animate-spin text-[#ad45ff] mx-auto" />
          <p className="text-gray-600 font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  const handleGoogleSignIn = async () => {
    try {
      // Redirige al flujo de Google OAuth
      await signIn?.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback", // ruta interna temporal
        redirectUrlComplete: "/admin/dashboard", // redirección final
      });
    } catch (err) {
      console.error("Error iniciando sesión con Google:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md space-y-6 sm:space-y-8">
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
            <div className="inline-flex items-center space-x-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium mx-auto">
              <CheckCircle className="w-4 h-4" />
              <span>Acceso Seguro</span>
            </div>

            <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">
              ¡Bienvenido de vuelta! 👋
            </CardTitle>

            <CardDescription className="text-gray-600 text-sm sm:text-base leading-relaxed">
              Accede a tu cuenta con Google y continúa gestionando tus torneos
              profesionales
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 px-4 sm:px-6 pb-6">
            {/* Botón de Google mejorado */}
            <Button
              size="lg"
              onClick={handleGoogleSignIn}
              className="cursor-pointer w-full h-12 sm:h-14 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] hover:from-[#9d35ef] hover:to-[#93a3ef] text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
            >
              <Shield className="w-5 h-5 mr-3" />
              Continuar con Google
            </Button>

            {/* Beneficios rápidos */}
            <div className="bg-gradient-to-r from-[#ad45ff]/5 to-[#a3b3ff]/5 rounded-xl p-4 border border-[#ad45ff]/20">
              <div className="text-center space-y-3">
                <h4 className="font-semibold text-gray-900 text-sm">
                  Acceso instantáneo a:
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-3 h-3 text-[#ad45ff] flex-shrink-0" />
                    <span>Panel de torneos</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="w-3 h-3 text-[#ad45ff] flex-shrink-0" />
                    <span>Gestión segura</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-3 h-3 text-[#ad45ff] flex-shrink-0" />
                    <span>Estadísticas</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-3 h-3 text-[#ad45ff] flex-shrink-0" />
                    <span>Reportes</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer profesional */}
            <div className="text-center space-y-3 pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500 leading-relaxed">
                Plataforma segura con cifrado SSL. Al continuar, aceptas
                nuestros{" "}
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
