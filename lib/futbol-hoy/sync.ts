import "server-only";

import { db } from "@/lib/db";

import { hayClaveConfigurada, traerFixturesDelDia } from "./api-football";
import { estadoDeFixture, estaTerminado } from "./estado";
import { hoyArgentino } from "./fecha";
import {
  avisoDeFrescura,
  decidirRefresco,
  type ContextoRefresco,
  type DecisionRefresco,
} from "./politica";
import type { FilaFixture } from "./types";

/**
 * Sincronización con API-Football: el único lugar que **escribe** la caché.
 *
 * Reparto de responsabilidades del módulo:
 * - `politica.ts` decide **si** corresponde llamar (puro, con tests).
 * - `api-football.ts` **llama** y traduce (impuro, sin decisiones).
 * - este archivo **coordina**: toma el candado, respeta el presupuesto,
 *   escribe y deja registro de lo que pasó.
 */

/** Lo que pasó al intentar sincronizar. Nadie tira: todo se devuelve como dato. */
export interface ResultadoSync {
  /** ¿Se llegó a llamar a la API? */
  llamado: boolean;
  /** Partidos guardados. Solo tiene sentido si `llamado`. */
  guardados: number;
  /** Motivo por el que NO se llamó, o el error si se llamó y falló. */
  detalle: string | null;
  decision: DecisionRefresco;
  /** Aviso para el usuario, o null si los datos están al día. */
  aviso: string | null;
}

/**
 * Estado actual de un día: lo que la política necesita saber antes de decidir.
 * Tres consultas chicas, todas por índice.
 */
async function leerContexto(
  matchDay: string,
  ahora: Date,
): Promise<ContextoRefresco> {
  const hoy = hoyArgentino(ahora);

  const [sync, cuota, guardados] = await Promise.all([
    db.worldFixtureSync.findUnique({ where: { matchDay } }),
    db.apiFootballQuota.findUnique({ where: { day: hoy } }),
    db.worldFixture.findMany({
      where: { matchDay },
      select: { statusShort: true, elapsed: true, homeGoals: true, awayGoals: true },
    }),
  ]);

  // "Pendiente" se calcula con la MISMA función que usa la UI (`estadoDeFixture`)
  // y no con una lista de códigos escrita a mano acá: si mañana se corrige la
  // traducción de un estado, la política se corrige con ella. Una segunda copia
  // de esa regla es exactamente la clase de duplicado que este repo ya pagó caro.
  const hayPendientes = guardados.some(
    (f) => !estaTerminado(estadoDeFixture(f)),
  );

  return {
    ahora,
    matchDay,
    hoy,
    sync: sync
      ? { lastAttemptAt: sync.lastAttemptAt, lastSuccessAt: sync.lastSuccessAt }
      : null,
    requestsHoy: cuota?.requestCount ?? 0,
    hayDatos: guardados.length > 0,
    hayPendientes,
  };
}

/**
 * Toma el candado del día: devuelve `true` solo si a este proceso le toca
 * llamar a la API.
 *
 * **Es un compare-and-set en la base, no un flag en memoria.** El server corre
 * en varias instancias (y en desarrollo se recarga en caliente), así que un
 * `let sincronizando = false` no serviría: dos visitas simultáneas pasarían las
 * dos y gastarían dos llamadas de las 100. El `updateMany` condicional lo
 * resuelve con la garantía del motor: la fila se actualiza una sola vez, y
 * quien no la actualiza obtiene `count: 0` y se va.
 */
async function tomarCandado(
  matchDay: string,
  ahora: Date,
  intervaloMs: number,
): Promise<boolean> {
  const umbral = new Date(ahora.getTime() - intervaloMs);

  const { count } = await db.worldFixtureSync.updateMany({
    where: { matchDay, lastAttemptAt: { lt: umbral } },
    data: { lastAttemptAt: ahora },
  });
  if (count > 0) return true;

  // count 0 = o la fila no existe todavía, o alguien la acaba de tomar.
  // Crearla es la forma atómica de distinguir los dos casos: si otro proceso
  // ganó la carrera, el create choca contra la PK y ese proceso pierde.
  try {
    await db.worldFixtureSync.create({
      data: { matchDay, lastAttemptAt: ahora },
    });
    return true;
  } catch {
    return false;
  }
}

/** Suma al contador de cuota del día calendario. */
async function gastarCuota(dia: string, requests: number): Promise<void> {
  if (requests <= 0) return;
  await db.apiFootballQuota.upsert({
    where: { day: dia },
    create: { day: dia, requestCount: requests },
    update: { requestCount: { increment: requests } },
  });
}

/**
 * Escribe los partidos traídos.
 *
 * Dos operaciones en **una transacción**, porque juntas son un reemplazo del
 * día y a medias dejarían la página inconsistente:
 *
 * 1. Borra los partidos de ese día que la API ya no informa (se reprogramaron a
 *    otra fecha, o se cayeron del calendario). Sin este paso la caché solo
 *    crece y muestra partidos fantasma.
 * 2. Inserta o actualiza los que llegaron.
 *
 * El upsert va de a uno: son ~150 filas por día como mucho, y `createMany` con
 * `skipDuplicates` no sirve acá —lo que hay que hacer es **pisar** el marcador
 * viejo, que es justamente lo que ese modo evita—.
 */
async function guardarFilas(
  matchDay: string,
  filas: readonly FilaFixture[],
  ahora: Date,
): Promise<void> {
  const ids = filas.map((f) => f.fixtureId);

  await db.$transaction([
    db.worldFixture.deleteMany({
      where: { matchDay, fixtureId: { notIn: ids } },
    }),
    ...filas.map((fila) =>
      db.worldFixture.upsert({
        where: { fixtureId: fila.fixtureId },
        create: { ...fila, syncedAt: ahora },
        update: { ...fila, syncedAt: ahora },
      }),
    ),
  ]);
}

/**
 * Deja el día al día, si corresponde.
 *
 * Es la función que llaman la página y el endpoint público: **la actualización
 * es perezosa, disparada por la lectura**. Se eligió así en vez de depender de
 * un cron por una razón concreta del plan gratuito: sin visitas no se gasta
 * cuota. Un cron cada 20 minutos consume sus 72 llamadas diarias aunque no
 * entre nadie; este esquema consume solo cuando alguien está mirando, y el
 * `POST /api/world-fixtures/refresh` queda igual disponible para quien sí
 * quiera programarlo.
 *
 * `forzar` saltea el candado de tiempo pero **nunca** el presupuesto: es para
 * el endpoint de refresco, no un pase libre para gastar la cuota.
 */
export async function sincronizarDia(
  matchDay: string,
  opciones: { forzar?: boolean; ahora?: Date } = {},
): Promise<ResultadoSync> {
  const ahora = opciones.ahora ?? new Date();
  const ctx = await leerContexto(matchDay, ahora);
  const decision = decidirRefresco(ctx);

  if (!hayClaveConfigurada()) {
    return {
      llamado: false,
      guardados: 0,
      detalle: "FOOTBALL_API_KEY no está configurada.",
      decision,
      aviso:
        "La sección todavía no está configurada: falta la clave del proveedor de datos.",
    };
  }

  const debeLlamar = decision.refrescar || opciones.forzar === true;
  // El presupuesto se verifica también en el camino forzado: es el límite que,
  // si se saltea, deja sin servicio al resto del día.
  const sinCuota = decision.motivo === "CUOTA_AGOTADA";

  if (!debeLlamar || sinCuota) {
    return {
      llamado: false,
      guardados: 0,
      detalle: decision.motivo ?? null,
      decision,
      aviso: avisoDeFrescura(ctx, decision),
    };
  }

  // Al forzar, el candado se toma igual pero con intervalo 0: sigue siendo
  // atómico (dos refrescos simultáneos no llaman dos veces) sin esperar.
  const candado = await tomarCandado(
    matchDay,
    ahora,
    opciones.forzar ? 0 : decision.intervaloMs,
  );
  if (!candado) {
    return {
      llamado: false,
      guardados: 0,
      detalle: "RECIEN_ACTUALIZADO",
      decision,
      aviso: avisoDeFrescura(ctx, decision),
    };
  }

  const { filas, requests, error } = await traerFixturesDelDia(matchDay);

  // La cuota se descuenta ANTES de mirar si hubo error: una llamada fallida
  // también se la cobró el proveedor. Descontarla solo en el camino feliz haría
  // que un proveedor intermitente nos dejara gastar mucho más de lo permitido.
  await gastarCuota(ctx.hoy, requests);

  if (error) {
    await db.worldFixtureSync.update({
      where: { matchDay },
      data: { lastError: error },
    });
    return {
      llamado: true,
      guardados: 0,
      detalle: error,
      decision,
      aviso:
        avisoDeFrescura(ctx, decision) ??
        "No pudimos actualizar los resultados en este momento.",
    };
  }

  await guardarFilas(matchDay, filas, ahora);

  await db.worldFixtureSync.update({
    where: { matchDay },
    data: {
      lastSuccessAt: ahora,
      fixtureCount: filas.length,
      lastError: null,
    },
  });

  return {
    llamado: true,
    guardados: filas.length,
    detalle: null,
    decision,
    aviso: null,
  };
}
