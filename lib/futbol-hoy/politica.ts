/**
 * Política de refresco: **cuándo se puede gastar una llamada a API-Football**.
 *
 * Es la regla de negocio central del módulo, y por eso vive acá —pura, sin
 * Prisma ni `Date.now()`— en vez de repartida entre el endpoint y la página.
 * El plan gratuito del proveedor da **100 requests por día para toda la
 * aplicación**, no por usuario: sin una regla explícita, veinte visitas en un
 * minuto queman la cuota y la página se queda sin datos hasta la medianoche
 * siguiente. Es exactamente la clase de límite que en este proyecto se verifica
 * en todos los caminos que lo cruzan, no solo en el que se escribió primero.
 */

/**
 * Cada cuánto se vuelve a consultar el día en curso. Es el número que pidió el
 * producto y el que fija el techo de consumo: 24 h / 20 min = 72 llamadas si
 * hubiera visitas las 24 horas, dentro de las 100 del plan.
 */
export const INTERVALO_MS = 20 * 60 * 1000;

/**
 * Intervalo para un día **sin nada por resolverse**: uno futuro, o uno cuyos
 * partidos ya terminaron todos. Ahí no hay marcador que cambie; refrescar cada
 * 20 minutos sería gastar cuota para reescribir los mismos datos.
 */
export const INTERVALO_LARGO_MS = 6 * 60 * 60 * 1000;

/**
 * Techo diario propio, deliberadamente **por debajo** de las 100 del plan.
 *
 * Los 20 de margen no son timidez: son para el endpoint manual de refresco, un
 * cron si se configura, y para que un día raro (un reintento, un deploy) no
 * deje la aplicación sin cuota. Contra el límite se falla del lado de no
 * gastar: un dato de hace 25 minutos se nota poco, una página vacía toda la
 * tarde se nota mucho.
 */
export const PRESUPUESTO_DIARIO = 80;

/** El estado que la política necesita saber de la última sincronización. */
export interface EstadoSync {
  lastAttemptAt: Date;
  lastSuccessAt: Date | null;
}

export type MotivoNoRefrescar =
  /** Se consultó hace menos que el intervalo que le toca a este día. */
  | "RECIEN_ACTUALIZADO"
  /** Se llegó al techo diario de llamadas. */
  | "CUOTA_AGOTADA"
  /** Día pasado y ya resuelto: el resultado no va a cambiar nunca más. */
  | "DIA_CERRADO";

export interface DecisionRefresco {
  refrescar: boolean;
  /** Solo cuando `refrescar` es false. */
  motivo?: MotivoNoRefrescar;
  /** Intervalo que se aplicó, para poder explicarlo en el aviso. */
  intervaloMs: number;
}

export interface ContextoRefresco {
  ahora: Date;
  /** Día pedido (`AAAA-MM-DD`). */
  matchDay: string;
  /** Hoy en Argentina (`AAAA-MM-DD`). */
  hoy: string;
  /** Fila de sincronización de ese día, o null si nunca se sincronizó. */
  sync: EstadoSync | null;
  /**
   * Llamadas ya gastadas **hoy**, sumando todas las fechas consultadas. Es un
   * contador global del día calendario, no del día de partidos: la cuota del
   * proveedor se agota junta.
   */
  requestsHoy: number;
  /** ¿Hay al menos un partido guardado para ese día? */
  hayDatos: boolean;
  /** ¿Quedó alguno sin resultado definitivo (programado, en juego, suspendido)? */
  hayPendientes: boolean;
}

/**
 * Intervalo que le corresponde a este día.
 *
 * Solo el día en curso **y con algo por resolverse** merece los 20 minutos. Un
 * día futuro, o uno cuyos partidos terminaron todos, se revisa cada 6 horas.
 */
function intervaloDe(ctx: ContextoRefresco): number {
  const esHoy = ctx.matchDay === ctx.hoy;
  if (esHoy && (ctx.hayPendientes || !ctx.hayDatos)) return INTERVALO_MS;
  return INTERVALO_LARGO_MS;
}

/**
 * ¿Corresponde llamar a la API?
 *
 * El orden de las guardas importa y no es arbitrario:
 *
 * 1. **Sin datos siempre se intenta**, aunque el día esté cerrado: una página
 *    vacía no se arregla sola, y es el caso de la primera visita.
 * 2. **La cuota manda sobre el resto de las guardas.** Es el único límite que,
 *    si se ignora, rompe el servicio para lo que queda del día.
 * 3. **Un día pasado y resuelto no se vuelve a pedir nunca.** Los resultados de
 *    ayer no cambian; gastar una llamada en confirmarlos es cuota que le falta
 *    a los partidos de hoy.
 */
export function decidirRefresco(ctx: ContextoRefresco): DecisionRefresco {
  const intervaloMs = intervaloDe(ctx);
  const gastadas = ctx.requestsHoy;

  // 1. Nunca se trajo nada de este día: hay que intentarlo sí o sí, salvo cuota.
  if (!ctx.sync || !ctx.hayDatos) {
    if (gastadas >= PRESUPUESTO_DIARIO) {
      return { refrescar: false, motivo: "CUOTA_AGOTADA", intervaloMs };
    }
    return { refrescar: true, intervaloMs };
  }

  // 2. Cuota diaria: por encima del techo no se llama, pase lo que pase.
  if (gastadas >= PRESUPUESTO_DIARIO) {
    return { refrescar: false, motivo: "CUOTA_AGOTADA", intervaloMs };
  }

  // 3. Día pasado y sin nada pendiente: resultado definitivo, no se toca más.
  if (ctx.matchDay < ctx.hoy && !ctx.hayPendientes) {
    return { refrescar: false, motivo: "DIA_CERRADO", intervaloMs };
  }

  // 4. Candado de tiempo. Se mide contra el ÚLTIMO INTENTO, no contra el último
  //    éxito: si el proveedor está caído, reintentar en loop cada request no lo
  //    levanta y sí quema la cuota.
  const transcurrido = ctx.ahora.getTime() - ctx.sync.lastAttemptAt.getTime();
  if (transcurrido < intervaloMs) {
    return { refrescar: false, motivo: "RECIEN_ACTUALIZADO", intervaloMs };
  }

  return { refrescar: true, intervaloMs };
}

/**
 * Aviso para el usuario cuando el dato mostrado podría no ser el último.
 *
 * Devuelve `null` cuando no hay nada que aclarar — que es el caso normal. Un
 * dato viejo sin avisar es peor que no tener el dato: el hincha cree que el
 * partido sigue 1-0 cuando terminó 3-1.
 */
export function avisoDeFrescura(
  ctx: ContextoRefresco,
  decision: DecisionRefresco,
): string | null {
  if (!ctx.hayDatos && !ctx.sync?.lastSuccessAt) {
    return "Todavía no pudimos traer los partidos de esta fecha. Volvé a intentar en unos minutos.";
  }

  if (decision.motivo === "CUOTA_AGOTADA") {
    return "Llegamos al límite diario de consultas al proveedor de datos. Los resultados pueden estar desactualizados hasta mañana.";
  }

  if (ctx.sync?.lastSuccessAt) {
    const minutos = Math.floor(
      (ctx.ahora.getTime() - ctx.sync.lastSuccessAt.getTime()) / 60000,
    );
    // El umbral es el doble del intervalo: con uno solo, cualquier visita a los
    // 21 minutos vería un cartel de alarma por un retraso de un minuto.
    if (minutos * 60000 > decision.intervaloMs * 2) {
      return `Los resultados se actualizaron por última vez hace ${minutos} minutos.`;
    }
  }

  return null;
}

/**
 * Traduce el error crudo del proveedor a algo que le sirva a quien mira la
 * página.
 *
 * El mensaje de API-Football viene en inglés y hablando de su producto
 * (*"Free plans do not have access to this date"*), que no es asunto del
 * hincha. Pero **tampoco alcanza con un genérico**: "no pudimos actualizar" ante
 * una fecha que el plan no cubre haría pensar que es una falla pasajera y que
 * conviene recargar, cuando en realidad no va a funcionar nunca.
 */
export function avisoDeError(error: string): string {
  const e = error.toLowerCase();

  if (e.includes("plan") && e.includes("date")) {
    return "Esa fecha no está disponible: el plan contratado con el proveedor de datos solo cubre los próximos días.";
  }

  if (e.includes("request limit") || e.includes("cuota")) {
    return "Llegamos al límite diario de consultas al proveedor de datos. Los resultados pueden estar desactualizados hasta mañana.";
  }

  if (e.includes("invalid api key") || e.includes("token")) {
    return "La sección no está bien configurada: el proveedor de datos rechazó la clave.";
  }

  return "No pudimos actualizar los resultados en este momento.";
}
