"use client";

import { cn } from "@/lib/utils";

interface FullscreenLoadingProps {
  isVisible: boolean;
  message?: string;
  className?: string;
}

export function FullscreenLoading({
  isVisible,
  message = "Cargando...",
  className,
}: Readonly<FullscreenLoadingProps>) {
  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] backdrop-blur-sm",
        className
      )}
    >
      <div className="flex flex-col items-center justify-center space-y-6 bg-white rounded-2xl p-12 shadow-2xl border max-w-md mx-4">
        {/* Soccer Ball Spinner */}
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-white via-gray-100 to-gray-300 shadow-lg animate-spin border-4 border-gray-200">
            {/* Soccer ball pattern */}
            <div className="absolute inset-2 rounded-full border-2 border-gray-800"></div>
            {/* Shine effect */}
            <div className="absolute top-1 left-1 w-3 h-3 bg-white/60 rounded-full blur-sm"></div>
          </div>
        </div>

        {/* Loading text */}
        <div className="text-center space-y-3">
          <h3 className="text-2xl font-bold text-gray-900">{message}</h3>
          <p className="text-gray-600">Por favor espera un momento...</p>

          {/* Animated dots */}
          <div className="flex justify-center space-x-2">
            <div className="w-3 h-3 bg-[#ad45ff] rounded-full animate-bounce"></div>
            <div
              className="w-3 h-3 bg-[#ad45ff] rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-3 h-3 bg-[#ad45ff] rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
