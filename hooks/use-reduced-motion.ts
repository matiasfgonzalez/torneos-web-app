"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

// `matchMedia` es un sistema externo a React: se lee con useSyncExternalStore,
// no con useEffect + setState (render en cascada, lo rechaza el linter).
// Ver docs/AGENT_RULES.md.
function subscribe(onChange: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

const getSnapshot = () => window.matchMedia(QUERY).matches;
/** En el server no hay matchMedia. `false` = el caso común (sin la preferencia). */
const getServerSnapshot = () => false;

/**
 * ¿El usuario pidió menos movimiento? (F4)
 *
 * `globals.css` ya anula animaciones y transiciones **de CSS** bajo
 * `prefers-reduced-motion`, pero una animación hecha en JS (el contador de los
 * KPIs, por ejemplo) sigue corriendo igual: el navegador no sabe que ese
 * `requestAnimationFrame` es decorativo. Para eso está este hook.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
