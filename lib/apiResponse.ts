import { NextResponse } from "next/server";

/**
 * Convención de respuestas de la API (decidida en A7, 2026-07-05):
 *
 * - Éxito: los datos directos (`apiOk(entidad)` / `apiOk(lista)`).
 *   Listas vacías devuelven `[]`, NUNCA un objeto `{ message }`.
 * - Error: `{ error, details? }` con el status HTTP correcto (`apiError`).
 *   Nunca texto plano (`new NextResponse("...")`).
 *
 * Las rutas de `users/*` conservan su envelope `{ success, data, ... }`
 * histórico; la unificación total al envelope se hace en el rewrite de
 * rutas de N1/N2 para no tocar todos los consumers dos veces.
 */

export function apiOk<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function apiError(status: number, error: string, details?: unknown) {
  return NextResponse.json(
    details === undefined ? { error } : { error, details },
    { status },
  );
}
