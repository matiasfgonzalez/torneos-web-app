"use client";

import { useSyncExternalStore } from "react";

/** No hay nada a lo que suscribirse: el valor solo cambia al hidratar. */
const emptySubscribe = () => () => {};

/**
 * `false` durante el render del server y la hidratación, `true` después.
 *
 * Es el guard estándar para todo lo que solo puede resolverse en el browser
 * (tema, `localStorage`, `window`), y evita el mismatch de hidratación.
 *
 * Reemplaza al viejo `const [mounted, setMounted] = useState(false)` +
 * `useEffect(() => setMounted(true), [])`, que dispara un render en cascada y
 * que el linter rechaza (`react-hooks/set-state-in-effect`).
 */
export function useIsMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
