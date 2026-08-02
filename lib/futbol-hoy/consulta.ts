import "server-only";

import { db } from "@/lib/db";

import { agruparPorLiga, totalizar } from "./agrupar";
import { estaEnVivo, estadoDeFixture } from "./estado";
import { esDiaValido, hoyArgentino } from "./fecha";
import { sincronizarDia } from "./sync";
import type { RespuestaFutbolHoy } from "./types";

/**
 * Lectura de la sección: **la única puerta** que usan la página y la API.
 *
 * Junta los tres pasos en el orden correcto: dejar el día al día (si la
 * política lo permite), leer la caché y agrupar por liga. La página nunca habla
 * con API-Football ni arma el agrupamiento por su cuenta.
 */

/**
 * Partidos de un día, agrupados por liga y listos para renderizar.
 *
 * Si el día pedido no es válido, cae a hoy en vez de fallar: la fecha llega por
 * query string y un `?fecha=chau` no puede tumbar una página pública.
 */
export async function obtenerFutbolDelDia(
  diaPedido?: string | null,
): Promise<RespuestaFutbolHoy> {
  const hoy = hoyArgentino();
  const matchDay = diaPedido && esDiaValido(diaPedido) ? diaPedido : hoy;

  // La sincronización **no puede tumbar la lectura**: si el proveedor está
  // caído o la escritura falla, la caché que ya está guardada sigue sirviendo
  // para renderizar. Es la diferencia entre "los resultados están viejos" y
  // "la página no carga".
  let aviso: string | null = null;
  try {
    const resultado = await sincronizarDia(matchDay);
    aviso = resultado.aviso;
  } catch (e) {
    console.error("[futbol-hoy] falló la sincronización", e);
    aviso = "No pudimos actualizar los resultados en este momento.";
  }

  const [filas, sync] = await Promise.all([
    db.worldFixture.findMany({
      where: { matchDay },
      orderBy: { kickoff: "asc" },
    }),
    db.worldFixtureSync.findUnique({
      where: { matchDay },
      select: { lastSuccessAt: true },
    }),
  ]);

  const ligas = agruparPorLiga(filas);

  return {
    matchDay,
    hoy,
    ligas,
    totales: totalizar(ligas),
    actualizadoEn: sync?.lastSuccessAt?.toISOString() ?? null,
    aviso,
  };
}

/**
 * Cifras del día para el apartado de la home: cuántos partidos hay y cuántos se
 * están jugando.
 *
 * **No sincroniza a propósito.** La home la abre cualquier visitante, incluido
 * quien no va a entrar a la sección; disparar una llamada al proveedor desde
 * ahí gastaría cuota para adornar un botón. Lee lo que ya esté guardado y, si
 * no hay nada, devuelve ceros — el apartado se muestra igual, invitando a entrar.
 */
export async function contarPartidosDeHoy(): Promise<{
  partidos: number;
  enVivo: number;
}> {
  const matchDay = hoyArgentino();

  try {
    // Solo los cuatro campos que deciden el estado: la home no muestra ni un
    // nombre de equipo, así que traer la fila entera sería payload para nada.
    const filas = await db.worldFixture.findMany({
      where: { matchDay },
      select: {
        statusShort: true,
        elapsed: true,
        homeGoals: true,
        awayGoals: true,
      },
    });

    const enVivo = filas.filter((f) => estaEnVivo(estadoDeFixture(f))).length;
    return { partidos: filas.length, enVivo };
  } catch (e) {
    // La home no se cae por un contador: sin base, el apartado muestra su copy
    // genérico y el link sigue funcionando.
    console.error("[futbol-hoy] no se pudieron contar los partidos de hoy", e);
    return { partidos: 0, enVivo: 0 };
  }
}
