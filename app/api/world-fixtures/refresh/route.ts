import { apiError, apiOk } from "@/lib/apiResponse";
import { esDiaValido, hoyArgentino } from "@/lib/futbol-hoy/fecha";
import { sincronizarDia } from "@/lib/futbol-hoy/sync";

/**
 * `GET /api/world-fixtures/refresh` — fuerza una sincronización con
 * API-Football del día indicado (por defecto, hoy).
 *
 * Pensado para **cron-job.org**, que es el planificador que usa este proyecto
 * (ver README, sección "Fútbol de hoy"). No hace falta para que la sección
 * funcione —la página se actualiza sola al visitarse, ver `sincronizarDia`—,
 * pero con el cron los resultados se mantienen frescos aunque no entre nadie.
 *
 * **Es un GET, aunque escriba**, por dos razones concretas:
 * 1. cron-job.org (como los cron de Vercel) dispara **GET** por defecto.
 * 2. `proxy.ts` exige sesión de Clerk en toda escritura de `/api` — defensa en
 *    profundidad que acá jugaría en contra, porque un cron no tiene sesión.
 *
 * **El token se acepta de dos formas**, porque cron-job.org soporta las dos y
 * conviene que la más fácil de configurar también sea segura:
 * - Cabecera `Authorization: Bearer <token>` (pestaña "Headers" del job).
 * - Query string `?token=<token>` (basta con pegar la URL completa).
 *
 * **Sin token configurado el endpoint queda cerrado** (503), no abierto. Cada
 * llamada gasta de las 100 diarias del plan gratuito, así que un endpoint
 * público sería una forma de que un tercero nos deje sin datos hasta mañana con
 * un `while true; do curl ...; done`.
 */
export async function GET(request: Request) {
  const esperado = process.env.FOOTBALL_CRON_TOKEN?.trim();
  if (!esperado) {
    return apiError(
      503,
      "El refresco programado no está habilitado: falta configurar FOOTBALL_CRON_TOKEN.",
    );
  }

  const url = new URL(request.url);
  const cabecera = request.headers.get("authorization") ?? "";
  const recibido = cabecera.startsWith("Bearer ")
    ? cabecera.slice("Bearer ".length)
    : (url.searchParams.get("token") ?? "");

  if (recibido !== esperado) {
    return apiError(401, "No autorizado.");
  }

  const pedido = url.searchParams.get("date");
  if (pedido && !esDiaValido(pedido)) {
    return apiError(400, "La fecha tiene que tener el formato AAAA-MM-DD.");
  }

  const matchDay = pedido ?? hoyArgentino();
  const resultado = await sincronizarDia(matchDay, { forzar: true });

  // Siempre 200 con el detalle: para cron-job.org, "no llamé porque se agotó la
  // cuota" es una ejecución correcta, no un fallo del endpoint. Un 500 ahí
  // dispararía las alertas de job fallido del planificador sin motivo.
  return apiOk({
    matchDay,
    llamado: resultado.llamado,
    guardados: resultado.guardados,
    detalle: resultado.detalle,
  });
}
