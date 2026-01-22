"use client";

import { cn } from "@/lib/utils";
import { Trophy } from "lucide-react";

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
      {/* Premium Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a0a2e] via-[#2d1b4e] to-[#1a0a2e]" />

      {/* Animated Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#ad45ff]/20 via-[#c77dff]/10 to-[#a3b3ff]/20 animate-pulse" />

      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#ad45ff]/30 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#a3b3ff]/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#c77dff]/10 rounded-full blur-3xl" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Loading Card */}
      <div className="relative z-10 flex flex-col items-center justify-center max-w-md mx-4">
        {/* Glassmorphism Card */}
        <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-white/20">
          {/* Glow effect behind card */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#ad45ff] via-[#c77dff] to-[#a3b3ff] rounded-3xl blur-xl opacity-30 animate-pulse" />

          <div className="relative flex flex-col items-center space-y-8">
            {/* Premium Soccer Ball Animation */}
            <div className="relative">
              {/* Outer rotating ring */}
              <div
                className="absolute -inset-4 rounded-full border-2 border-dashed border-[#ad45ff]/40 animate-spin"
                style={{ animationDuration: "8s" }}
              />

              {/* Middle pulsing ring */}
              <div
                className="absolute -inset-2 rounded-full border border-[#a3b3ff]/30 animate-ping"
                style={{ animationDuration: "2s" }}
              />

              {/* Soccer ball container */}
              <div className="relative w-24 h-24 flex items-center justify-center">
                {/* Glow behind ball */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#ad45ff] to-[#a3b3ff] rounded-full blur-lg opacity-50 animate-pulse" />

                {/* Soccer ball */}
                <div
                  className="relative w-20 h-20 rounded-full bg-gradient-to-br from-white via-gray-100 to-gray-200 shadow-2xl animate-bounce"
                  style={{ animationDuration: "1.5s" }}
                >
                  {/* Pentagon patterns */}
                  <svg
                    viewBox="0 0 100 100"
                    className="absolute inset-0 w-full h-full"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="48"
                      fill="none"
                      stroke="#1a0a2e"
                      strokeWidth="2"
                    />
                    {/* Center pentagon */}
                    <polygon
                      points="50,20 65,40 58,60 42,60 35,40"
                      fill="#1a0a2e"
                    />
                    {/* Top pentagon */}
                    <polygon
                      points="50,5 60,15 55,25 45,25 40,15"
                      fill="#1a0a2e"
                      opacity="0.8"
                    />
                    {/* Bottom left */}
                    <polygon
                      points="25,70 35,65 40,75 35,85 25,80"
                      fill="#1a0a2e"
                      opacity="0.8"
                    />
                    {/* Bottom right */}
                    <polygon
                      points="75,70 65,65 60,75 65,85 75,80"
                      fill="#1a0a2e"
                      opacity="0.8"
                    />
                    {/* Left */}
                    <polygon
                      points="15,45 25,40 30,50 25,60 15,55"
                      fill="#1a0a2e"
                      opacity="0.8"
                    />
                    {/* Right */}
                    <polygon
                      points="85,45 75,40 70,50 75,60 85,55"
                      fill="#1a0a2e"
                      opacity="0.8"
                    />
                  </svg>
                  {/* Shine effect */}
                  <div className="absolute top-2 left-3 w-4 h-4 bg-white/80 rounded-full blur-sm" />
                  <div className="absolute top-4 left-5 w-2 h-2 bg-white/60 rounded-full" />
                </div>
              </div>
            </div>

            {/* Loading Text */}
            <div className="text-center space-y-3">
              <h3 className="text-2xl font-bold text-white tracking-wide">
                {message}
              </h3>
              <p className="text-white/60 text-sm">{submessage}</p>
            </div>

            {/* Premium Progress Bar */}
            <div className="w-full space-y-3">
              <div className="relative h-2 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                {/* Animated gradient bar */}
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#ad45ff] via-[#c77dff] to-[#a3b3ff] rounded-full"
                  style={{
                    animation: "loading-progress 2s ease-in-out infinite",
                    width: "100%",
                  }}
                />
                {/* Shimmer effect */}
                <div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  style={{
                    animation: "shimmer 1.5s ease-in-out infinite",
                  }}
                />
              </div>

              {/* Animated dots */}
              <div className="flex justify-center items-center gap-2">
                <div
                  className="w-2 h-2 bg-[#ad45ff] rounded-full animate-bounce shadow-lg shadow-[#ad45ff]/50"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-2 h-2 bg-[#c77dff] rounded-full animate-bounce shadow-lg shadow-[#c77dff]/50"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-2 h-2 bg-[#a3b3ff] rounded-full animate-bounce shadow-lg shadow-[#a3b3ff]/50"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Brand Footer */}
        <div className="mt-8 flex items-center gap-2 text-white/40">
          <Trophy className="w-4 h-4" />
          <span className="text-sm font-medium tracking-wider">
            PREMIUM GOLAZO
          </span>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes loading-progress {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
