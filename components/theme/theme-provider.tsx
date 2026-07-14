"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import { useIsMounted } from "@/hooks/use-mounted";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  attribute?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

/** Evento propio: `storage` solo avisa a las OTRAS pestañas, no a la actual. */
const THEME_EVENT = "golazo:theme-change";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(THEME_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(THEME_EVENT, onChange);
  };
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "golazo-ui-theme",
  // Se destructuran (sin usarse) para que no lleguen al Provider vía ...props
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  attribute = "class",
  enableSystem = true,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  disableTransitionOnChange = false,
  ...props
}: ThemeProviderProps) {
  const mounted = useIsMounted();

  // El tema vive en localStorage, que es un store EXTERNO a React: se lee con
  // useSyncExternalStore. Leerlo en un useEffect + setState (como antes) hace
  // renderizar dos veces —una con el tema por defecto y otra con el real— y el
  // linter lo rechaza (react-hooks/set-state-in-effect).
  const theme = useSyncExternalStore(
    subscribe,
    useCallback(
      () => (localStorage.getItem(storageKey) as Theme | null) ?? defaultTheme,
      [storageKey, defaultTheme],
    ),
    // En el server no hay localStorage.
    useCallback(() => defaultTheme, [defaultTheme]),
  );

  const setTheme = useCallback(
    (next: Theme) => {
      localStorage.setItem(storageKey, next);
      // Notifica a esta misma pestaña: el `storage` nativo no lo hace.
      window.dispatchEvent(new Event(THEME_EVENT));
    },
    [storageKey],
  );

  // Sincroniza la clase del <html> con el tema. Esto sí es trabajo de effect:
  // escribir en un sistema externo (el DOM), no actualizar estado de React.
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system" && enableSystem) {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme, enableSystem]);

  // Con el tema en "system", seguir los cambios de preferencia del sistema.
  useEffect(() => {
    if (!enableSystem) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      if (theme === "system") {
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(mediaQuery.matches ? "dark" : "light");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, enableSystem]);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {mounted ? (
        children
      ) : (
        <div style={{ visibility: "hidden" }}>{children}</div>
      )}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
