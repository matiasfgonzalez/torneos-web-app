"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, RefreshCw } from "lucide-react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: Readonly<ErrorPageProps>) {
  useEffect(() => {
    console.error("Error no manejado:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden relative">
      {/* Premium Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f051a] via-[#1a0a2e] to-[#0f051a]" />

      {/* Subtle Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-brand/10 via-transparent to-brand-2/10" />

      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand/5 rounded-full blur-3xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-lg w-full mx-4 text-center">
        {/* Logo */}
        <div className="relative mb-8 inline-block">
          <div
            className="absolute inset-0 bg-gradient-to-r from-brand to-brand-2 rounded-2xl blur-2xl opacity-30"
            style={{ animation: "pulse-glow 3s ease-in-out infinite" }}
          />
          <div
            className="relative w-24 h-24 bg-gradient-to-br from-brand to-brand-2 rounded-2xl flex items-center justify-center shadow-2xl shadow-brand/30 mx-auto"
            style={{ animation: "float 4s ease-in-out infinite" }}
          >
            <span className="text-5xl">⚽</span>
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-brand via-brand-mid to-brand-2 bg-clip-text text-transparent mb-4">
            ¡Se nos escapó la pelota!
          </h1>
          <p className="text-white/60 text-lg leading-relaxed max-w-md mx-auto">
            Ocurrió un error inesperado. Podés reintentar o volver al inicio;
            el equipo ya está avisado.
          </p>
          {error.digest && (
            <p className="text-white/30 text-xs mt-3 font-mono">
              Código: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
          <Button
            onClick={reset}
            className="bg-gradient-to-r from-brand to-brand-2 hover:from-brand-hover hover:to-brand-2-hover text-white shadow-lg shadow-brand/25 hover:shadow-brand/40 transition-all px-6 py-5 cursor-pointer"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Reintentar
          </Button>
          <Button
            asChild
            variant="link"
            className="border-white/20 text-white hover:bg-white/10 transition-all px-6 py-5"
          >
            <Link href="/" className="flex items-center gap-2">
              <Home className="w-5 h-5" />
              Volver al Inicio
            </Link>
          </Button>
        </div>

        <div className="mt-10 flex items-center justify-center gap-2 text-white/30">
          <span className="text-sm">GOLAZO</span>
          <span className="text-xs">•</span>
          <span className="text-xs">Gestión Profesional de Torneos</span>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.25; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}
