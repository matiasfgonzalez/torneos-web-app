import { MatchStatus } from "@/lib/generated/prisma/enums";

import type { EstadoFixture } from "./types";

/**
 * Traducción de los códigos de estado de API-Football al enum `MatchStatus`
 * que ya usa la app.
 *
 * **Por qué se guarda el código crudo en la BD y se traduce acá:** el proveedor
 * puede agregar un código mañana. Si la traducción viviera en el momento de
 * escribir, ese código nuevo se perdería para siempre y arreglarlo pediría
 * volver a llamar a la API (cuota que no tenemos). Guardando `statusShort` tal
 * cual, corregir el mapeo es editar este archivo y recargar la página.
 *
 * Referencia de los códigos: docs de API-Football, sección Fixtures → Status.
 */
const MAPA: Record<string, EstadoFixture> = {
  // Todavía no empezó
  TBD: MatchStatus.PROGRAMADO, // hora por confirmar
  NS: MatchStatus.PROGRAMADO, // not started

  // En curso
  "1H": MatchStatus.EN_JUEGO, // primer tiempo
  "2H": MatchStatus.EN_JUEGO, // segundo tiempo
  ET: MatchStatus.EN_JUEGO, // tiempo suplementario
  P: MatchStatus.EN_JUEGO, // definición por penales
  LIVE: MatchStatus.EN_JUEGO, // en juego, sin minuto informado

  // Pausas
  HT: MatchStatus.ENTRETIEMPO, // entretiempo
  BT: MatchStatus.ENTRETIEMPO, // pausa antes del suplementario

  // Terminó
  FT: MatchStatus.FINALIZADO, // tiempo reglamentario
  AET: MatchStatus.FINALIZADO, // tras el suplementario
  PEN: MatchStatus.FINALIZADO, // tras los penales

  // Se frenó
  SUSP: MatchStatus.SUSPENDIDO,
  INT: MatchStatus.SUSPENDIDO, // interrumpido
  ABD: MatchStatus.SUSPENDIDO, // abandonado

  // No se juega en esta fecha
  PST: MatchStatus.POSTERGADO,
  CANC: MatchStatus.CANCELADO,

  // Ganado en los escritorios
  AWD: MatchStatus.WALKOVER, // technical loss
  WO: MatchStatus.WALKOVER,
};

/** Estados en los que la pelota está rodando (o el partido está en pausa). */
const EN_CURSO: ReadonlySet<EstadoFixture> = new Set([
  MatchStatus.EN_JUEGO,
  MatchStatus.ENTRETIEMPO,
]);

/** Estados en los que ya hay un resultado definitivo. */
const TERMINADOS: ReadonlySet<EstadoFixture> = new Set([
  MatchStatus.FINALIZADO,
  MatchStatus.WALKOVER,
  MatchStatus.CANCELADO,
]);

/**
 * Estado de dominio de un partido.
 *
 * Ante un código **desconocido** no se adivina un valor fijo: se deduce del
 * dato que sí tenemos. Si nunca hubo minuto ni goles, el partido no empezó
 * (`PROGRAMADO`); si los hubo, algo pasó y ya no está por jugarse
 * (`FINALIZADO`). Elegir siempre `PROGRAMADO` mostraría "hoy 20:00" sobre un
 * partido terminado hace dos horas, que es la mentira más visible de las dos.
 */
export function estadoDeFixture(fixture: {
  statusShort: string;
  elapsed?: number | null;
  homeGoals?: number | null;
  awayGoals?: number | null;
}): EstadoFixture {
  const conocido = MAPA[fixture.statusShort.toUpperCase()];
  if (conocido) return conocido;

  const hayJuego =
    (fixture.elapsed ?? 0) > 0 ||
    fixture.homeGoals != null ||
    fixture.awayGoals != null;
  return hayJuego ? MatchStatus.FINALIZADO : MatchStatus.PROGRAMADO;
}

/** ¿Se está jugando ahora mismo (incluido el entretiempo)? */
export function estaEnVivo(estado: EstadoFixture): boolean {
  return EN_CURSO.has(estado);
}

/** ¿Ya tiene resultado definitivo? Nada que refrescar de un partido así. */
export function estaTerminado(estado: EstadoFixture): boolean {
  return TERMINADOS.has(estado);
}

/**
 * ¿Corresponde mostrar el marcador en vez de la hora?
 *
 * Un `0 - 0` de un partido que no arrancó es información falsa: hasta el pitazo
 * inicial se muestra la hora de comienzo. Un postergado tampoco tiene marcador
 * que mostrar aunque la API mande ceros.
 */
export function mostrarMarcador(estado: EstadoFixture): boolean {
  return (
    estado === MatchStatus.EN_JUEGO ||
    estado === MatchStatus.ENTRETIEMPO ||
    estado === MatchStatus.FINALIZADO ||
    estado === MatchStatus.SUSPENDIDO ||
    estado === MatchStatus.WALKOVER
  );
}

// El label y el color del badge NO se definen acá: al reutilizar `MatchStatus`
// ya sirven `MATCH_STATUS_LABELS` y `MATCH_STATUS_COLORS`, que consume
// `<StatusBadge entity="match">`. Un segundo mapa de etiquetas para los mismos
// ocho estados sería justo el tipo de duplicado que en este repo terminó en dos
// componentes divergiendo en silencio.
