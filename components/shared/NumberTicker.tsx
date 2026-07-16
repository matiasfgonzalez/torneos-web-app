"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";

/** Igual que la curva `--ease-out` de globals.css, pero en JS. */
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const DURATION_MS = 700;

/**
 * Contador que anima de 0 al valor final (F4).
 *
 * Solo para KPIs: el número subiendo dice "esto se acaba de medir" y engancha
 * la vista en el dato. Fuera de un KPI es ruido — no lo uses en una tabla ni
 * en un marcador (ahí el número tiene que ser legible al instante, no dentro
 * de 700ms).
 *
 * Respeta `prefers-reduced-motion`: con la preferencia activa pinta el valor
 * final y no anima. El CSS global no alcanzaría — esto es `requestAnimationFrame`,
 * que la media query no toca.
 */
export function NumberTicker({
  value,
  className,
}: Readonly<{ value: number; className?: string }>) {
  const reduced = usePrefersReducedMotion();
  const [animated, setAnimated] = useState(0);
  const frame = useRef<number>(undefined);

  // El valor mostrado es DERIVADO: con `prefers-reduced-motion` (o un número
  // raro) se pinta el final sin tocar el estado. Apagar la animación con un
  // `setState` en el cuerpo del effect dispara un render en cascada y el linter
  // lo rechaza (react-hooks/set-state-in-effect) — ver docs/AGENT_RULES.md.
  const animate = !reduced && Number.isFinite(value);
  const display = animate ? animated : value;

  useEffect(() => {
    if (!animate) return;

    // Siempre desde 0: estos KPIs se montan al abrir la pantalla, así que el
    // usuario ve "de 0 a 12" una sola vez.
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / DURATION_MS, 1);
      // Este setState vive en el callback del rAF, no en el cuerpo del effect:
      // es la forma correcta de sincronizar con un sistema externo.
      setAnimated(Math.round(easeOut(progress) * value));
      if (progress < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);

    return () => {
      if (frame.current !== undefined) cancelAnimationFrame(frame.current);
    };
  }, [value, animate]);

  return (
    // `tabular-nums`: sin ancho fijo por dígito el número "tiembla" mientras
    // sube, porque el 1 es más angosto que el 8.
    <span className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      {display.toLocaleString("es-AR")}
    </span>
  );
}
