"use client";

import { useState, useEffect } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme/theme-provider";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Evitar hidration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Cerrar menu al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest("[data-theme-toggle]")) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showMenu]);

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className="h-9 w-9 p-0" disabled>
        <div className="h-4 w-4 animate-pulse bg-gray-300 rounded"></div>
      </Button>
    );
  }

  const themeConfig = {
    light: {
      icon: Sun,
      label: "Modo claro",
      description: "Cambiar a tema claro",
    },
    dark: {
      icon: Moon,
      label: "Modo oscuro",
      description: "Cambiar a tema oscuro",
    },
    system: {
      icon: Monitor,
      label: "Sistema",
      description: "Usar preferencia del sistema",
    },
  };

  const CurrentIcon = themeConfig[theme]?.icon || Monitor;

  return (
    <div className="relative" data-theme-toggle>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowMenu(!showMenu)}
        className="h-9 w-9 p-0 rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-[#ad45ff]/10 hover:to-[#a3b3ff]/10 hover:border-[#ad45ff]/20 hover:shadow-lg group"
        aria-label={themeConfig[theme]?.description || "Cambiar tema"}
      >
        <div className="relative">
          <CurrentIcon className="h-4 w-4 text-gray-600 dark:text-gray-300 transition-all duration-300 group-hover:text-[#ad45ff] group-hover:scale-110" />

          {/* Indicador de estado activo */}
          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      </Button>

      {/* Menu desplegable */}
      {showMenu && (
        <div className="absolute top-full right-0 mt-2 w-48 p-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-xl rounded-xl z-50 animate-fade-in">
          {Object.entries(themeConfig).map(([key, config]) => {
            const Icon = config.icon;
            const isActive = theme === key;

            return (
              <button
                key={key}
                onClick={() => {
                  setTheme(key as "light" | "dark" | "system");
                  setShowMenu(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-[#ad45ff]/10 to-[#a3b3ff]/10 border border-[#ad45ff]/20 text-[#ad45ff] font-medium shadow-sm"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200"
                }`}
              >
                <div
                  className={`p-1.5 rounded-md transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] shadow-md"
                      : "bg-gray-100 dark:bg-gray-700"
                  }`}
                >
                  <Icon
                    className={`h-3.5 w-3.5 ${
                      isActive
                        ? "text-white"
                        : "text-gray-600 dark:text-gray-300"
                    }`}
                  />
                </div>

                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{config.label}</span>
                    {isActive && (
                      <div className="w-1.5 h-1.5 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] rounded-full animate-pulse"></div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}

          {/* Footer informativo */}
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center px-2 py-1">
              Tema actual:{" "}
              <span className="font-medium text-[#ad45ff]">
                {themeConfig[theme]?.label}
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

