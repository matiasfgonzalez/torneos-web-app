import type { NextConfig } from "next";

/**
 * Content-Security-Policy pragmática:
 * - Bloquea scripts/conexiones a orígenes no listados (mitiga XSS con exfiltración).
 * - 'unsafe-inline'/'unsafe-eval' quedan permitidos porque Next.js y Clerk los
 *   requieren sin configuración de nonces; endurecer cuando se haga F0.
 * - Al pasar Clerk a producción (dominio propio), agregar ese dominio acá.
 */
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline'",
  // media.api-sports.io: escudos de equipo, logos de liga y banderas de la
  // sección "Fútbol de hoy". Son URLs del proveedor que se guardan tal cual en
  // la caché (no se re-suben a Cloudinary), así que el navegador las pide
  // directo y sin este origen la página se vería sin un solo escudo.
  "img-src 'self' blob: data: https://res.cloudinary.com https://img.clerk.com https://images.clerk.dev https://lh3.googleusercontent.com https://media.api-sports.io",
  "font-src 'self' data:",
  "connect-src 'self' https://*.clerk.accounts.dev https://clerk-telemetry.com https://api.cloudinary.com",
  "frame-src https://challenges.cloudflare.com https://*.clerk.accounts.dev",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // Solo aplica sobre HTTPS; inocuo en desarrollo local
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.clerk.dev",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
