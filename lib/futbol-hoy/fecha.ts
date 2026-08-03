/**
 * El "día" de la sección Fútbol de hoy.
 *
 * La seccion entera se agrupa por **día calendario argentino**, no por día UTC:
 * un partido que arranca a las 22:00 del sábado en Buenos Aires es
 * `2026-08-02T01:00:00Z`, o sea domingo en UTC. Agrupar por UTC lo mandaría al
 * día siguiente y el hincha no lo encontraría donde lo busca.
 *
 * Se usa el mismo criterio que `lib/formatDate.ts`: **offset fijo UTC-3**.
 * Argentina no aplica horario de verano desde 2009, así que un offset fijo es
 * exacto y no arrastra una tabla de zonas horarias.
 */

/** Zona horaria que se le pide a API-Football, para que devuelva el día correcto. */
export const ZONA_HORARIA = "America/Argentina/Buenos_Aires";

const OFFSET_ARGENTINA_MS = -3 * 60 * 60 * 1000;

const FORMATO_DIA = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Día calendario argentino de un instante, como `AAAA-MM-DD`.
 *
 * Se construye con los componentes **UTC** del instante ya desplazado, no con
 * `getFullYear()`/`getMonth()`: esos leen la zona de quien ejecuta el código, y
 * el resultado cambiaría entre el server (UTC) y el navegador del usuario.
 */
export function diaArgentino(instante: Date): string {
  const desplazado = new Date(instante.getTime() + OFFSET_ARGENTINA_MS);
  const anio = desplazado.getUTCFullYear();
  const mes = String(desplazado.getUTCMonth() + 1).padStart(2, "0");
  const dia = String(desplazado.getUTCDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

/** Día argentino de hoy. */
export function hoyArgentino(ahora: Date = new Date()): string {
  return diaArgentino(ahora);
}

/**
 * ¿Es un día con forma `AAAA-MM-DD` y que además existe en el calendario?
 *
 * El regex solo por sí mismo deja pasar `2026-02-31` y `2026-13-01`, que la API
 * respondería con un error genérico o —peor— con una lista vacía que parece
 * "no hay partidos". Se valida acá, antes de gastar una llamada.
 */
export function esDiaValido(valor: string): boolean {
  if (!FORMATO_DIA.test(valor)) return false;
  const [anio, mes, dia] = valor.split("-").map(Number);
  const fecha = new Date(Date.UTC(anio, mes - 1, dia));
  return (
    fecha.getUTCFullYear() === anio &&
    fecha.getUTCMonth() === mes - 1 &&
    fecha.getUTCDate() === dia
  );
}

/**
 * Corre un día N jornadas (sirve para los botones de fecha de la página).
 * Trabaja en UTC sobre el mediodía para no rozar ningún borde de día.
 */
export function correrDia(matchDay: string, dias: number): string {
  const [anio, mes, dia] = matchDay.split("-").map(Number);
  const base = new Date(Date.UTC(anio, mes - 1, dia, 12, 0, 0));
  base.setUTCDate(base.getUTCDate() + dias);
  return `${base.getUTCFullYear()}-${String(base.getUTCMonth() + 1).padStart(2, "0")}-${String(base.getUTCDate()).padStart(2, "0")}`;
}

/**
 * Cuántos días hacia adelante ofrece la navegación de fechas, **hoy incluido**.
 *
 * ⚠️ **No es una decisión de diseño: es el límite del plan del proveedor.** El
 * plan gratuito de API-Football solo da acceso a la ventana `hoy … hoy+2`; para
 * cualquier otra fecha responde `200 OK` con
 * `{"errors":{"plan":"Free plans do not have access to this date, try from
 * 2026-08-02 to 2026-08-04"}}`. Verificado contra la API real el 2026-08-02.
 *
 * Por eso **no hay botón "Ayer"**: sería un botón que lleva siempre a una
 * página vacía, que es justo lo que la regla de "no anuncies lo que no existe"
 * viene a evitar. Con un plan pago, subir este número (y agregar días hacia
 * atrás) es la única edición necesaria.
 */
export const DIAS_NAVEGABLES = 3;

/** Fechas que ofrece la barra de navegación, de hoy hacia adelante. */
export function diasNavegables(
  hoy: string,
): { etiqueta: string; dia: string }[] {
  const etiquetas = ["Hoy", "Mañana", "Pasado mañana"];

  return Array.from({ length: DIAS_NAVEGABLES }, (_, i) => ({
    etiqueta: etiquetas[i] ?? `+${i} días`,
    dia: correrDia(hoy, i),
  }));
}
