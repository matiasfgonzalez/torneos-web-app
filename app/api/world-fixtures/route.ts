import { NextResponse } from "next/server";

import { obtenerFutbolDelDia } from "@/lib/futbol-hoy/consulta";

/**
 * `GET /api/world-fixtures?date=AAAA-MM-DD` — partidos del fútbol mundial de una
 * fecha, agrupados por liga (sección "Fútbol de hoy").
 *
 * **Público y de solo lectura**, como el resto de la superficie de hincha. No
 * expone nada sensible: son datos de terceros que ya son públicos, y la clave
 * de API-Football nunca sale del server (ver `api-football.ts`).
 *
 * Lo consume el polling de la página para refrescar marcadores sin recargar.
 * `date` es opcional: sin ella, hoy en hora de Argentina. Una fecha inválida no
 * es un 400 sino un fallback a hoy — es un parámetro de navegación, no un dato
 * que el usuario cargue.
 *
 * **`no-store` es deliberado.** Cachear esta respuesta en el CDN sería cachear
 * un marcador en vivo; el ahorro que importa (las llamadas al proveedor) ya lo
 * da la caché en base de datos, que es la que tiene la política de 20 minutos.
 */
export async function GET(request: Request) {
  const date = new URL(request.url).searchParams.get("date");
  const datos = await obtenerFutbolDelDia(date);

  return NextResponse.json(datos, {
    status: 200,
    headers: { "Cache-Control": "no-store" },
  });
}
