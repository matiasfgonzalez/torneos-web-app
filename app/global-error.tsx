"use client";

import { useEffect } from "react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Error boundary de último recurso: reemplaza al root layout completo,
 * por eso define <html>/<body> y usa estilos inline (Tailwind puede no
 * estar disponible si falló el layout).
 */
export default function GlobalError({
  error,
  reset,
}: Readonly<GlobalErrorProps>) {
  useEffect(() => {
    console.error("Error global no manejado:", error);
  }, [error]);

  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f051a 0%, #1a0a2e 50%, #0f051a 100%)",
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: "#fff",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 480, padding: 24 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>⚽</div>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
              marginBottom: 12,
              background: "linear-gradient(90deg, #ad45ff, #a3b3ff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Algo salió muy mal
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: 24 }}>
            Ocurrió un error crítico en la aplicación. Probá recargar la
            página.
          </p>
          {error.digest && (
            <p
              style={{
                color: "rgba(255,255,255,0.3)",
                fontSize: 12,
                fontFamily: "monospace",
                marginBottom: 24,
              }}
            >
              Código: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            style={{
              background: "linear-gradient(90deg, #ad45ff, #a3b3ff)",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "12px 28px",
              fontSize: 16,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
