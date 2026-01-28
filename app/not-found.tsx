"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Trophy, Users, Newspaper, Search } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center overflow-hidden relative">
      {/* Premium Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f051a] via-[#1a0a2e] to-[#0f051a]" />

      {/* Subtle Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#ad45ff]/10 via-transparent to-[#a3b3ff]/10" />

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-2 h-2 bg-[#ad45ff]/60 rounded-full blur-[1px]"
          style={{
            left: "15%",
            top: "20%",
            animation: "float-particle 6s ease-in-out infinite",
          }}
        />
        <div
          className="absolute w-1.5 h-1.5 bg-[#c77dff]/50 rounded-full blur-[1px]"
          style={{
            left: "75%",
            top: "30%",
            animation: "float-particle 8s ease-in-out infinite",
            animationDelay: "1s",
          }}
        />
        <div
          className="absolute w-1 h-1 bg-[#a3b3ff]/70 rounded-full"
          style={{
            left: "10%",
            top: "75%",
            animation: "float-particle 7s ease-in-out infinite",
            animationDelay: "2s",
          }}
        />
        <div
          className="absolute w-2 h-2 bg-[#ad45ff]/40 rounded-full blur-[2px]"
          style={{
            left: "85%",
            top: "65%",
            animation: "float-particle 9s ease-in-out infinite",
            animationDelay: "0.5s",
          }}
        />
        <div
          className="absolute w-1.5 h-1.5 bg-[#c77dff]/60 rounded-full"
          style={{
            left: "45%",
            top: "85%",
            animation: "float-particle 7s ease-in-out infinite",
            animationDelay: "3s",
          }}
        />
        <div
          className="absolute w-1 h-1 bg-[#a3b3ff]/50 rounded-full"
          style={{
            left: "55%",
            top: "10%",
            animation: "float-particle 6s ease-in-out infinite",
            animationDelay: "1.5s",
          }}
        />

        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#ad45ff]/5 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-lg w-full mx-4 text-center">
        {/* Logo with Animation */}
        <div className="relative mb-8 inline-block">
          {/* Glow */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] rounded-2xl blur-2xl opacity-30"
            style={{ animation: "pulse-glow 3s ease-in-out infinite" }}
          />

          {/* Logo */}
          <div
            className="relative w-24 h-24 bg-gradient-to-br from-[#ad45ff] to-[#a3b3ff] rounded-2xl flex items-center justify-center shadow-2xl shadow-[#ad45ff]/30 mx-auto"
            style={{ animation: "float 4s ease-in-out infinite" }}
          >
            <span className="text-5xl">🏆</span>
          </div>

          {/* Orbital ring */}
          <div
            className="absolute -inset-6 border border-[#ad45ff]/20 rounded-full"
            style={{ animation: "spin-slow 15s linear infinite" }}
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#ad45ff] rounded-full shadow-lg shadow-[#ad45ff]/50" />
          </div>
        </div>

        {/* 404 Error */}
        <div className="mb-8">
          <h1 className="text-8xl font-bold bg-gradient-to-r from-[#ad45ff] via-[#c77dff] to-[#a3b3ff] bg-clip-text text-transparent mb-4">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-white mb-3">
            ¡Página no encontrada!
          </h2>
          <p className="text-white/60 text-lg leading-relaxed max-w-md mx-auto">
            Parece que la página que buscas se fue fuera del campo. No te
            preocupes, podemos ayudarte a volver al juego.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
          <Button
            asChild
            className="bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] hover:from-[#9d35ef] hover:to-[#93a3ef] text-white shadow-lg shadow-[#ad45ff]/25 hover:shadow-[#ad45ff]/40 transition-all px-6 py-5"
          >
            <Link href="/" className="flex items-center gap-2">
              <Home className="w-5 h-5" />
              Volver al Inicio
            </Link>
          </Button>
          <Button
            onClick={handleGoBack}
            variant="link"
            className="border-white/20 text-white hover:bg-white/10 transition-all cursor-pointer px-6 py-5"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Página Anterior
          </Button>
        </div>

        {/* Quick Links */}
        <div className="border-t border-white/10 pt-8">
          <p className="text-white/40 text-sm mb-4">
            O explora estas secciones:
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-white/60 hover:text-white hover:bg-white/10 transition-all"
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
              className="text-white/60 hover:text-white hover:bg-white/10 transition-all"
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
              className="text-white/60 hover:text-white hover:bg-white/10 transition-all"
            >
              <Link href="/noticias" className="flex items-center gap-2">
                <Newspaper className="w-4 h-4" />
                Noticias
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-white/60 hover:text-white hover:bg-white/10 transition-all"
            >
              <Link href="/jugadores" className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Jugadores
              </Link>
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 flex items-center justify-center gap-2 text-white/30">
          <span className="text-sm">GOLAZO</span>
          <span className="text-xs">•</span>
          <span className="text-xs">Gestión Profesional de Torneos</span>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        @keyframes float-particle {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
            opacity: 0.3;
          }
          25% {
            transform: translateY(-20px) translateX(10px);
            opacity: 0.8;
          }
          50% {
            transform: translateY(-10px) translateX(-5px);
            opacity: 0.5;
          }
          75% {
            transform: translateY(-25px) translateX(5px);
            opacity: 0.7;
          }
        }
        
        @keyframes pulse-glow {
          0%, 100% {
            opacity: 0.25;
            transform: scale(1);
          }
          50% {
            opacity: 0.4;
            transform: scale(1.1);
          }
        }
        
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
