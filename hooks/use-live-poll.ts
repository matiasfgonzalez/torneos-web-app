"use client";

import { useEffect, useRef } from "react";

/**
 * Polling con conciencia de visibilidad (S6). Ejecuta `callback` cada
 * `intervalMs` mientras `enabled` sea true Y la pestaña esté visible: si el
 * hincha manda la app a segundo plano, dejamos de pegarle al server hasta que
 * vuelva (ahorra datos y batería en la cancha). Al volver a foco, refresca al
 * instante y retoma el intervalo.
 *
 * `callback` se guarda en un ref y se actualiza en cada render, así el intervalo
 * no se reinicia cuando cambia la función (evita perder el timer entre polls).
 */
export function useLivePoll(
  callback: () => void | Promise<void>,
  intervalMs: number,
  enabled: boolean,
): void {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(() => {
    if (!enabled) return;

    let timer: ReturnType<typeof setInterval> | null = null;

    const tick = () => {
      if (document.visibilityState === "visible") {
        void savedCallback.current();
      }
    };

    const start = () => {
      if (timer === null) timer = setInterval(tick, intervalMs);
    };

    const stop = () => {
      if (timer !== null) {
        clearInterval(timer);
        timer = null;
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void savedCallback.current(); // refresco inmediato al volver a foco
        start();
      } else {
        stop();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    tick(); // primer refresco inmediato al habilitarse (no espera un intervalo)
    start();

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [enabled, intervalMs]);
}
