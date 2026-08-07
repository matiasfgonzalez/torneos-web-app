"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView, type Variants } from "framer-motion";

import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";

/**
 * Animaciones de aparición al hacer scroll de la landing.
 *
 * **Dos reglas que estos componentes tienen que cumplir sí o sí**, y que la
 * primera versión no cumplía:
 *
 * 1. **El contenido nunca depende de la animación para verse.** `motion.div`
 *    con `initial={{ opacity: 0 }}` escribe ese estilo **también en el HTML del
 *    server**: sin JavaScript (o si framer-motion no hidrata) la landing entera
 *    quedaba en blanco, y un rastreador que no ejecuta JS veía una página
 *    vacía. La clase `.reveal` existe para eso: `globals.css` la fuerza a
 *    visible dentro de `<noscript>` (ver `app/layout.tsx`).
 * 2. **`prefers-reduced-motion` se respeta en JS, no solo en CSS.** La regla
 *    global de `globals.css` acorta animaciones y transiciones *de CSS*, pero
 *    estas son inline y calculadas por JS: el navegador no las toca. Con la
 *    preferencia activa no se anima nada — el contenido se renderiza visible y
 *    listo (ver docs/AGENT_RULES.md).
 */

/** Clase de rescate: la usa el `<noscript>` y la regla de reduced-motion. */
const REVEAL = "reveal";

const EASE_SALIDA = [0.22, 1, 0.36, 1] as const;

/* ============================================================
   FadeInSection — aparece cuando entra en pantalla.
   ============================================================ */
interface FadeInSectionProps {
  children: React.ReactNode;
  className?: string;
  /** Desde dónde entra */
  direction?: "up" | "down" | "left" | "right" | "none";
  /** Retraso en segundos */
  delay?: number;
  /** Distancia de entrada en px */
  distance?: number;
  /** Fracción del elemento visible que dispara la animación */
  threshold?: number;
  /** ¿Re-animar cada vez que vuelve a entrar? */
  once?: boolean;
}

export function FadeInSection({
  children,
  className = "",
  direction = "up",
  delay = 0,
  distance = 40,
  threshold = 0.15,
  once = true,
}: Readonly<FadeInSectionProps>) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: threshold });
  const sinMovimiento = usePrefersReducedMotion();

  // Sin movimiento: un div común, visible desde el primer frame. No se usa
  // `motion.div` con la animación en 0 porque igual escribiría el `opacity: 0`
  // inicial en el HTML.
  if (sinMovimiento) {
    return <div className={className}>{children}</div>;
  }

  const offsets: Record<string, { x: number; y: number }> = {
    up: { x: 0, y: distance },
    down: { x: 0, y: -distance },
    left: { x: distance, y: 0 },
    right: { x: -distance, y: 0 },
    none: { x: 0, y: 0 },
  };

  const offset = offsets[direction];

  return (
    <motion.div
      ref={ref}
      className={`${REVEAL} ${className}`.trim()}
      initial={{ opacity: 0, x: offset.x, y: offset.y }}
      animate={
        isInView
          ? { opacity: 1, x: 0, y: 0 }
          : { opacity: 0, x: offset.x, y: offset.y }
      }
      transition={{ duration: 0.7, delay, ease: EASE_SALIDA }}
    >
      {children}
    </motion.div>
  );
}

/* ============================================================
   StaggerContainer + StaggerItem — lista que aparece escalonada.
   ============================================================ */
const staggerContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_SALIDA },
  },
};

interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  threshold?: number;
  once?: boolean;
}

export function StaggerContainer({
  children,
  className = "",
  threshold = 0.1,
  once = true,
}: Readonly<StaggerContainerProps>) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: threshold });
  const sinMovimiento = usePrefersReducedMotion();

  if (sinMovimiento) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={staggerContainerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
}

export function StaggerItem({ children, className = "" }: Readonly<StaggerItemProps>) {
  const sinMovimiento = usePrefersReducedMotion();

  if (sinMovimiento) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div className={`${REVEAL} ${className}`.trim()} variants={staggerItemVariants}>
      {children}
    </motion.div>
  );
}

/* ============================================================
   CountUp — número que cuenta hasta su valor al entrar en pantalla.
   ============================================================ */
interface CountUpProps {
  /** Valor final */
  target: number;
  /** Duración en ms */
  duration?: number;
  /** Sufijo (ej. "+", "%") */
  suffix?: string;
  /** Prefijo (ej. "$") */
  prefix?: string;
  /** Decimales */
  decimals?: number;
  className?: string;
}

export function CountUp({
  target,
  duration = 2000,
  suffix = "",
  prefix = "",
  decimals = 0,
  className = "",
}: Readonly<CountUpProps>) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const sinMovimiento = usePrefersReducedMotion();
  // Arranca en el valor final: así el HTML del server ya trae el número de
  // verdad (lo lee un rastreador, y se ve si el JS no llega). La cuenta solo
  // ocurre si además hay movimiento permitido.
  const [value, setValue] = useState(target);

  useEffect(() => {
    if (sinMovimiento || !isInView) return;

    let frame = 0;
    const startTime = performance.now();

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cúbico
      setValue(eased * target);
      if (progress < 1) frame = requestAnimationFrame(step);
    };

    // El arranque en 0 lo pone el primer frame del rAF, no una llamada acá:
    // un `setValue` en el cuerpo del effect encadena renders (react-hooks/
    // set-state-in-effect).
    frame = requestAnimationFrame(step);

    // Sin esto, el rAF sigue corriendo después de desmontar y llama a
    // `setValue` sobre un componente que ya no existe.
    return () => cancelAnimationFrame(frame);
  }, [isInView, target, duration, sinMovimiento]);

  // `Intl` en vez de un regex de miles: el lookahead `(\d{3})+` tiene
  // backtracking super-lineal, y además esto respeta el formato local (1.234).
  const formatted =
    prefix +
    value.toLocaleString("es-AR", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }) +
    suffix;

  return (
    <span ref={ref} className={className}>
      {formatted}
    </span>
  );
}
