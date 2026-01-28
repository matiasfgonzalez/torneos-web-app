"use client";

import { cn } from "@/lib/utils";

interface FullscreenLoadingProps {
  isVisible: boolean;
  message?: string;
  submessage?: string;
  className?: string;
}

export function FullscreenLoading({
  isVisible,
  message = "Cargando...",
  submessage = "Por favor espera un momento",
  className,
}: Readonly<FullscreenLoadingProps>) {
  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center overflow-hidden",
        className,
      )}
    >
      {/* Premium Gradient Background - Simplificado */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f051a] via-[#1a0a2e] to-[#0f051a]" />

      {/* Subtle Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#ad45ff]/10 via-transparent to-[#a3b3ff]/10" />

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Particle 1 */}
        <div
          className="absolute w-2 h-2 bg-[#ad45ff]/60 rounded-full blur-[1px]"
          style={{
            left: "20%",
            top: "30%",
            animation: "float-particle 6s ease-in-out infinite",
          }}
        />
        {/* Particle 2 */}
        <div
          className="absolute w-1.5 h-1.5 bg-[#c77dff]/50 rounded-full blur-[1px]"
          style={{
            left: "70%",
            top: "25%",
            animation: "float-particle 8s ease-in-out infinite",
            animationDelay: "1s",
          }}
        />
        {/* Particle 3 */}
        <div
          className="absolute w-1 h-1 bg-[#a3b3ff]/70 rounded-full"
          style={{
            left: "15%",
            top: "70%",
            animation: "float-particle 7s ease-in-out infinite",
            animationDelay: "2s",
          }}
        />
        {/* Particle 4 */}
        <div
          className="absolute w-2 h-2 bg-[#ad45ff]/40 rounded-full blur-[2px]"
          style={{
            left: "80%",
            top: "60%",
            animation: "float-particle 9s ease-in-out infinite",
            animationDelay: "0.5s",
          }}
        />
        {/* Particle 5 */}
        <div
          className="absolute w-1.5 h-1.5 bg-[#c77dff]/60 rounded-full"
          style={{
            left: "40%",
            top: "80%",
            animation: "float-particle 7s ease-in-out infinite",
            animationDelay: "3s",
          }}
        />
        {/* Particle 6 */}
        <div
          className="absolute w-1 h-1 bg-[#a3b3ff]/50 rounded-full"
          style={{
            left: "60%",
            top: "15%",
            animation: "float-particle 6s ease-in-out infinite",
            animationDelay: "1.5s",
          }}
        />

        {/* Subtle ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#ad45ff]/5 rounded-full blur-3xl" />
      </div>

      {/* Loading Content - Minimalista */}
      <div className="relative z-10 flex flex-col items-center justify-center max-w-sm mx-4">
        {/* Logo GOLAZO Animado */}
        <div className="relative mb-8">
          {/* Glow behind logo */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] rounded-2xl blur-2xl opacity-30"
            style={{ animation: "pulse-glow 3s ease-in-out infinite" }}
          />

          {/* Logo Container */}
          <div
            className="relative w-20 h-20 bg-gradient-to-br from-[#ad45ff] to-[#a3b3ff] rounded-2xl flex items-center justify-center shadow-2xl shadow-[#ad45ff]/30"
            style={{ animation: "float 4s ease-in-out infinite" }}
          >
            {/* Trophy emoji */}
            <span className="text-4xl">🏆</span>
          </div>

          {/* Orbital ring */}
          <div
            className="absolute -inset-4 border border-[#ad45ff]/20 rounded-full"
            style={{ animation: "spin-slow 12s linear infinite" }}
          >
            {/* Orbital dot */}
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#ad45ff] rounded-full shadow-lg shadow-[#ad45ff]/50" />
          </div>
        </div>

        {/* Brand Name */}
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-[#ad45ff] via-[#c77dff] to-[#a3b3ff] bg-clip-text text-transparent tracking-tight">
            GOLAZO
          </h2>
        </div>

        {/* Loading Text */}
        <div className="text-center mb-8 space-y-2">
          <h3 className="text-xl font-medium text-white/90 tracking-wide">
            {message}
          </h3>
          <p className="text-white/50 text-sm">{submessage}</p>
        </div>

        {/* Minimalist Progress Indicator */}
        <div className="w-48 space-y-4">
          {/* Progress bar */}
          <div className="relative h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] rounded-full"
              style={{ animation: "progress-slide 1.5s ease-in-out infinite" }}
            />
          </div>

          {/* Loading dots - Suave */}
          <div className="flex justify-center items-center gap-3">
            <div
              className="w-1.5 h-1.5 bg-[#ad45ff] rounded-full"
              style={{ animation: "pulse-dot 1.2s ease-in-out infinite" }}
            />
            <div
              className="w-1.5 h-1.5 bg-[#c77dff] rounded-full"
              style={{
                animation: "pulse-dot 1.2s ease-in-out infinite",
                animationDelay: "0.2s",
              }}
            />
            <div
              className="w-1.5 h-1.5 bg-[#a3b3ff] rounded-full"
              style={{
                animation: "pulse-dot 1.2s ease-in-out infinite",
                animationDelay: "0.4s",
              }}
            />
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
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
            transform: scale(1.05);
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
        
        @keyframes progress-slide {
          0% {
            left: -33%;
          }
          100% {
            left: 100%;
          }
        }
        
        @keyframes pulse-dot {
          0%, 100% {
            opacity: 0.4;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.3);
          }
        }
      `}</style>
    </div>
  );
}
