/*
 * GOLAZO Service Worker (S9. PWA) — sin dependencias.
 *
 * Objetivo: que la app sea instalable y aguante la cancha (señal mala). NO es
 * un cache agresivo: las páginas van network-first (online = siempre fresco),
 * y solo cuando no hay red se sirve la última copia vista o la pantalla offline.
 * Los assets con hash de Next (/_next/static) sí van cache-first porque son
 * inmutables. Nunca se toca /api, ni Clerk, ni Cloudinary (otro origen).
 */
const VERSION = "v1";
const STATIC_CACHE = `golazo-static-${VERSION}`;
const PAGES_CACHE = `golazo-pages-${VERSION}`;
const OFFLINE_URL = "/offline.html";

// Mínimo indispensable para responder sin red.
const PRECACHE = [OFFLINE_URL, "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== STATIC_CACHE && k !== PAGES_CACHE)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// Permite que el cliente fuerce la activación de una versión nueva.
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

const isStaticAsset = (url) =>
  url.pathname.startsWith("/_next/static") ||
  url.pathname.startsWith("/icons") ||
  /\.(?:png|jpe?g|svg|webp|gif|ico|woff2?)$/.test(url.pathname);

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response && response.ok && response.type === "basic") {
    const cache = await caches.open(STATIC_CACHE);
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirstPage(request) {
  try {
    const fresh = await fetch(request);
    if (fresh && fresh.ok) {
      const cache = await caches.open(PAGES_CACHE);
      cache.put(request, fresh.clone());
    }
    return fresh;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    const offline = await caches.match(OFFLINE_URL);
    return (
      offline ||
      new Response("Sin conexión", {
        status: 503,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      })
    );
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Solo GET; el resto (POST/PATCH/DELETE, server actions) pasa directo a red.
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Otro origen (Clerk, Cloudinary, telemetría) o la API: no lo intercepta el SW.
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api")) return;

  // Navegación de página completa → network-first con fallback offline.
  if (request.mode === "navigate") {
    event.respondWith(networkFirstPage(request));
    return;
  }

  // Assets estáticos inmutables → cache-first.
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request));
  }
});
