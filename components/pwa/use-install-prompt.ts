"use client";

import { useEffect, useState } from "react";
import { useIsMounted } from "@/hooks/use-mounted";

/**
 * El evento `beforeinstallprompt` no está en los tipos del DOM: lo declaramos.
 * Chrome/Edge/Android lo disparan cuando la PWA cumple los criterios de
 * instalación (manifest + service worker + https). Safari/iOS NO lo soporta.
 */
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt: () => Promise<void>;
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
}

type InstallState = {
  /** Hay un instalador nativo disponible (Chrome/Edge/Android). */
  canInstall: boolean;
  /** El dispositivo es iOS: se instala a mano (Compartir → Agregar a inicio). */
  isIOS: boolean;
  /** Ya está instalada / corriendo como app (standalone). */
  isInstalled: boolean;
  /** Dispara el prompt nativo. Devuelve el resultado o null si no hay prompt. */
  promptInstall: () => Promise<"accepted" | "dismissed" | null>;
};

function detectStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari expone su propio flag no estándar.
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function detectIOS(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  const isIPhoneOrIPad = /iphone|ipad|ipod/i.test(ua);
  // iPadOS moderno se hace pasar por Mac: lo detectamos por el touch.
  const isIPadOS =
    /macintosh/i.test(ua) && window.navigator.maxTouchPoints > 1;
  return isIPhoneOrIPad || isIPadOS;
}

export function useInstallPrompt(): InstallState {
  const mounted = useIsMounted();
  const [promptEvent, setPromptEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onBeforeInstall = (e: Event) => {
      // Evita el mini-infobar por defecto; disparamos el prompt desde el botón.
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setPromptEvent(null);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  // Lecturas estáticas del entorno: seguras durante el render una vez montado
  // (nunca en el server → sin mismatch de hidratación).
  const isInstalled = mounted && (installed || detectStandalone());
  const isIOS = mounted && detectIOS();

  const promptInstall = async () => {
    if (!promptEvent) return null;
    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    setPromptEvent(null);
    return outcome;
  };

  return {
    canInstall: mounted && !!promptEvent && !isInstalled,
    isIOS: !!isIOS,
    isInstalled: !!isInstalled,
    promptInstall,
  };
}
