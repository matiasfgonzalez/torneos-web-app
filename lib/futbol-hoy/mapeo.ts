import { diaArgentino } from "./fecha";
import type { ApiFootballFixture, ApiFootballRespuesta, FilaFixture } from "./types";

/**
 * Traducción de la respuesta cruda de API-Football a filas nuestras.
 *
 * **Función pura y única frontera con el JSON del proveedor.** Nada más en el
 * repo lee un `fixture.teams.home.name`: si mañana cambia la forma de la
 * respuesta, se arregla acá y nada más se entera. Por eso también es el archivo
 * que tiene tests: es donde un cambio del tercero rompe la app en silencio.
 */

/** Texto opcional del proveedor → `string | null`, sin espacios ni vacíos. */
function texto(valor: unknown): string | null {
  if (typeof valor !== "string") return null;
  const limpio = valor.trim();
  return limpio.length > 0 ? limpio : null;
}

/** Entero opcional del proveedor → `number | null`. Descarta NaN e infinitos. */
function entero(valor: unknown): number | null {
  return typeof valor === "number" && Number.isFinite(valor)
    ? Math.trunc(valor)
    : null;
}

/**
 * Un partido crudo → una fila, o `null` si le falta algo sin lo cual no se
 * puede mostrar ni guardar.
 *
 * **Se descarta la fila, no toda la respuesta.** Un partido roto entre 150 no
 * puede dejar sin datos a la página entera; el resto se guarda igual. Lo
 * imprescindible es poco a propósito: id, fecha parseable, estado y los dos
 * nombres de equipo. Todo lo demás (escudos, estadio, país) es adorno y viaja
 * como `null` sin drama.
 */
export function mapearFixture(crudo: ApiFootballFixture): FilaFixture | null {
  const fixtureId = entero(crudo.fixture?.id);
  if (fixtureId === null) return null;

  const iso = texto(crudo.fixture?.date);
  if (!iso) return null;
  const kickoff = new Date(iso);
  if (Number.isNaN(kickoff.getTime())) return null;

  const statusShort = texto(crudo.fixture?.status?.short);
  if (!statusShort) return null;

  const leagueId = entero(crudo.league?.id);
  const leagueName = texto(crudo.league?.name);
  if (leagueId === null || !leagueName) return null;

  const homeTeamName = texto(crudo.teams?.home?.name);
  const awayTeamName = texto(crudo.teams?.away?.name);
  if (!homeTeamName || !awayTeamName) return null;

  return {
    fixtureId,
    kickoff,
    // El día se calcula del instante, no del `date` en texto: la API devuelve la
    // fecha con el offset que se le pidió, pero el día que nos importa es el
    // argentino y lo decide una sola función (`diaArgentino`).
    matchDay: diaArgentino(kickoff),
    statusShort: statusShort.toUpperCase(),
    statusLong: texto(crudo.fixture?.status?.long),
    elapsed: entero(crudo.fixture?.status?.elapsed),
    leagueId,
    leagueName,
    leagueCountry: texto(crudo.league?.country),
    leagueLogo: texto(crudo.league?.logo),
    leagueFlag: texto(crudo.league?.flag),
    leagueRound: texto(crudo.league?.round),
    homeTeamId: entero(crudo.teams?.home?.id) ?? 0,
    homeTeamName,
    homeTeamLogo: texto(crudo.teams?.home?.logo),
    awayTeamId: entero(crudo.teams?.away?.id) ?? 0,
    awayTeamName,
    awayTeamLogo: texto(crudo.teams?.away?.logo),
    homeGoals: entero(crudo.goals?.home),
    awayGoals: entero(crudo.goals?.away),
    venueName: texto(crudo.fixture?.venue?.name),
    venueCity: texto(crudo.fixture?.venue?.city),
  };
}

/**
 * La respuesta completa → filas usables.
 *
 * Deduplica por `fixtureId`: la API pagina, y si dos páginas repitieran un
 * partido el upsert masivo fallaría con una clave duplicada dentro del mismo
 * lote (un error que solo aparece en producción, con volumen).
 */
export function mapearRespuesta(respuesta: ApiFootballRespuesta): FilaFixture[] {
  const crudos = Array.isArray(respuesta.response) ? respuesta.response : [];
  const porId = new Map<number, FilaFixture>();

  for (const crudo of crudos) {
    const fila = mapearFixture(crudo);
    if (fila) porId.set(fila.fixtureId, fila);
  }

  return [...porId.values()];
}

/**
 * ¿La respuesta trae errores del proveedor?
 *
 * **API-Football contesta `200 OK` con `errors` poblado** cuando la clave es
 * inválida, se acabó la cuota diaria o el plan no cubre el endpoint. Chequear
 * solo `res.ok` haría pasar esas respuestas como un día sin partidos, y la
 * página mostraría "no hay partidos hoy" en vez de decir la verdad.
 *
 * El campo cambia de forma según el caso —`[]` cuando está todo bien, y un
 * objeto `{ requests: "..." }` o un array de strings cuando no—, así que se
 * inspecciona en vez de tipearlo.
 */
export function erroresDeApi(respuesta: ApiFootballRespuesta): string | null {
  const errores = respuesta.errors;
  if (!errores) return null;

  if (Array.isArray(errores)) {
    const textos = errores.map((e) => String(e)).filter(Boolean);
    return textos.length > 0 ? textos.join(" · ") : null;
  }

  if (typeof errores === "object") {
    const entradas = Object.entries(errores as Record<string, unknown>)
      .map(([clave, valor]) => `${clave}: ${String(valor)}`)
      .filter(Boolean);
    return entradas.length > 0 ? entradas.join(" · ") : null;
  }

  const suelto = String(errores).trim();
  return suelto.length > 0 ? suelto : null;
}
