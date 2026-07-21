"use client";

import { Printer, ArrowLeft } from "lucide-react";

/**
 * Barra de acción del documento imprimible (S8). No se imprime (`no-print`):
 * el botón dispara el diálogo de impresión del navegador, donde el organizador
 * elige "Guardar como PDF" como destino.
 */
export function PrintToolbar({ title }: { title: string }) {
  return (
    <div className="no-print sticky top-0 z-10 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50"
            aria-label="Volver"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900">
              {title}
            </p>
            <p className="truncate text-xs text-gray-500">
              Elegí “Guardar como PDF” en el destino de impresión
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-brand to-brand-mid px-5 text-sm font-semibold text-white shadow-lg shadow-brand/25 transition-transform hover:-translate-y-0.5"
        >
          <Printer className="h-4 w-4" />
          Imprimir / Guardar PDF
        </button>
      </div>
    </div>
  );
}
