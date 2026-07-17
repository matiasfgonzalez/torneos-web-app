"use client";

import { useEffect } from "react";

/**
 * Registra el service worker de GOLAZO (S9. PWA). Sin UI: se monta una vez en
 * el layout raíz. Solo en producción — en dev, el HMR de Next y un SW que
 * cachea assets se pelean (páginas viejas servidas desde caché). El manifest y
 * la instalación funcionan igual en dev; el offline se prueba con build + start.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Un SW que no registra no puede romper la app: la degradación es a
        // "web normal, sin offline". No hay nada que reintentar acá.
      });
    };

    if (document.readyState === "complete") register();
    else {
      window.addEventListener("load", register);
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return null;
}
