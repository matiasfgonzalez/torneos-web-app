"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
    const [isDark, setIsDark] = useState(false);

    // Al montar el componente, leer preferencia previa o sistema
    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "dark") {
            document.documentElement.classList.add("dark");
            setIsDark(true);
        } else if (savedTheme === "light") {
            document.documentElement.classList.remove("dark");
            setIsDark(false);
        } else {
            // Si no hay preferencia, detectar el sistema
            const prefersDark = window.matchMedia(
                "(prefers-color-scheme: dark)"
            ).matches;
            if (prefersDark) {
                document.documentElement.classList.add("dark");
                setIsDark(true);
            }
        }
    }, []);

    // Función para cambiar tema
    const toggleTheme = () => {
        if (isDark) {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
            setIsDark(false);
        } else {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
            setIsDark(true);
        }
    };

    return (
        <button
            onClick={toggleTheme}
            aria-label="Toggle Dark Mode"
            className="p-2 rounded bg-primary text-primary-foreground hover:bg-primary/80 transition"
        >
            {isDark ? "☀️ Claro" : "🌙 Oscuro"}
        </button>
    );
}
