"use client";

import { useSyncExternalStore } from "react";

/**
 * ¿La página está scrolleada más de `umbral` píxeles?
 *
 * Lo usa el header en modo `overlay` (la landing) para pasar de transparente
 * sobre el hero a sólido apenas el contenido empieza a pasarle por debajo.
 *
 * Va con `useSyncExternalStore` y no con `useEffect` + `setState`, igual que
 * `use-reduced-motion`: el scroll es un sistema externo a React, y leerlo con
 * un effect que setea estado es el patrón que el linter del repo rechaza (ver
 * docs/AGENT_RULES.md).
 */
function suscribir(alCambiar: () => void) {
  // `passive`: este listener nunca llama a preventDefault, y avisarlo evita
  // que el navegador tenga que esperarlo para decidir si scrollea.
  window.addEventListener("scroll", alCambiar, { passive: true });
  return () => window.removeEventListener("scroll", alCambiar);
}

export function useScrolled(umbral = 24): boolean {
  return useSyncExternalStore(
    suscribir,
    () => window.scrollY > umbral,
    // En el server no hay scroll: se asume arriba de todo, que es como llega
    // cualquier carga inicial.
    () => false,
  );
}
