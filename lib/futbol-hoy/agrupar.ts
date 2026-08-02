import { estaEnVivo, estadoDeFixture } from "./estado";
import type { FixtureVista, GrupoLiga } from "./types";

/**
 * Agrupación de los partidos del día por liga y orden de las ligas.
 *
 * Función pura: recibe filas, devuelve bloques. No toca Prisma ni `Date.now()`,
 * así que el orden —que es una decisión de producto y la parte que más se
 * discute— se puede fijar en tests en vez de comprobarlo mirando la pantalla.
 */

/** Lo mínimo que necesita el agrupador. Coincide con lo que trae la BD. */
export interface FilaAgrupable {
  fixtureId: number;
  kickoff: Date | string;
  statusShort: string;
  statusLong: string | null;
  elapsed: number | null;
  leagueId: number;
  leagueName: string;
  leagueCountry: string | null;
  leagueLogo: string | null;
  leagueFlag: string | null;
  leagueRound: string | null;
  homeTeamName: string;
  homeTeamLogo: string | null;
  awayTeamName: string;
  awayTeamLogo: string | null;
  homeGoals: number | null;
  awayGoals: number | null;
  venueName: string | null;
  venueCity: string | null;
}

/**
 * Ligas que van primero, en este orden.
 *
 * Un día cualquiera trae 150+ partidos de 80 competiciones: sin un orden
 * curado, la tercera división de Islandia puede quedar arriba de la
 * Libertadores y el hincha argentino tiene que scrollear para encontrar lo que
 * vino a ver. Los ids son los de API-Football (`GET /leagues`).
 *
 * Es una decisión de producto, no técnica: editar esta lista es la forma
 * soportada de cambiar qué se destaca.
 */
export const LIGAS_DESTACADAS: readonly number[] = [
  128, // Liga Profesional Argentina
  129, // Primera Nacional (Argentina)
  130, // Copa Argentina
  13, // CONMEBOL Libertadores
  11, // CONMEBOL Sudamericana
  2, // UEFA Champions League
  3, // UEFA Europa League
  1, // Copa del Mundo
  9, // Copa América
  4, // Eurocopa
  39, // Premier League (Inglaterra)
  140, // LaLiga (España)
  135, // Serie A (Italia)
  78, // Bundesliga (Alemania)
  61, // Ligue 1 (Francia)
  71, // Brasileirão Série A
  262, // Liga MX (México)
];

const PRIORIDAD = new Map(LIGAS_DESTACADAS.map((id, i) => [id, i]));

/** Posición de una liga en el orden. Las no destacadas van todas al final. */
function prioridad(leagueId: number): number {
  return PRIORIDAD.get(leagueId) ?? Number.MAX_SAFE_INTEGER;
}

function aVista(fila: FilaAgrupable): FixtureVista {
  const estado = estadoDeFixture(fila);
  return {
    fixtureId: fila.fixtureId,
    kickoff:
      fila.kickoff instanceof Date ? fila.kickoff.toISOString() : fila.kickoff,
    estado,
    // El minuto solo tiene sentido con la pelota rodando: un `elapsed: 90`
    // pegado a un partido terminado se leería como "va 90'" en vez de "final".
    minuto: estaEnVivo(estado) ? fila.elapsed : null,
    homeTeamName: fila.homeTeamName,
    homeTeamLogo: fila.homeTeamLogo,
    awayTeamName: fila.awayTeamName,
    awayTeamLogo: fila.awayTeamLogo,
    homeGoals: fila.homeGoals,
    awayGoals: fila.awayGoals,
    venueName: fila.venueName,
    venueCity: fila.venueCity,
    leagueRound: fila.leagueRound,
  };
}

function instante(iso: string): number {
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? Number.MAX_SAFE_INTEGER : t;
}

/**
 * Filas → bloques por liga.
 *
 * Orden de las ligas: **primero las que tienen partidos en vivo** (es lo que el
 * hincha abrió la página a mirar), después las destacadas en el orden de
 * `LIGAS_DESTACADAS`, y el resto alfabético por país y nombre para que la lista
 * larga sea predecible. Dentro de cada liga, por hora de comienzo.
 */
export function agruparPorLiga(filas: readonly FilaAgrupable[]): GrupoLiga[] {
  const grupos = new Map<number, GrupoLiga>();

  for (const fila of filas) {
    let grupo = grupos.get(fila.leagueId);
    if (!grupo) {
      grupo = {
        leagueId: fila.leagueId,
        leagueName: fila.leagueName,
        leagueCountry: fila.leagueCountry,
        leagueLogo: fila.leagueLogo,
        leagueFlag: fila.leagueFlag,
        enVivo: 0,
        partidos: [],
      };
      grupos.set(fila.leagueId, grupo);
    }

    const vista = aVista(fila);
    grupo.partidos.push(vista);
    if (estaEnVivo(vista.estado)) grupo.enVivo += 1;
  }

  const ordenados = [...grupos.values()];

  for (const grupo of ordenados) {
    grupo.partidos.sort(
      (a, b) =>
        instante(a.kickoff) - instante(b.kickoff) ||
        a.homeTeamName.localeCompare(b.homeTeamName, "es"),
    );
  }

  ordenados.sort((a, b) => {
    if (a.enVivo > 0 !== b.enVivo > 0) return a.enVivo > 0 ? -1 : 1;

    const pa = prioridad(a.leagueId);
    const pb = prioridad(b.leagueId);
    if (pa !== pb) return pa - pb;

    return (
      (a.leagueCountry ?? "").localeCompare(b.leagueCountry ?? "", "es") ||
      a.leagueName.localeCompare(b.leagueName, "es")
    );
  });

  return ordenados;
}

/** Cifras del encabezado. Se calculan de los grupos ya armados, no de la BD. */
export function totalizar(ligas: readonly GrupoLiga[]) {
  let partidos = 0;
  let enVivo = 0;
  let finalizados = 0;

  for (const liga of ligas) {
    partidos += liga.partidos.length;
    enVivo += liga.enVivo;
    finalizados += liga.partidos.filter(
      (p) => p.estado === "FINALIZADO" || p.estado === "WALKOVER",
    ).length;
  }

  return { partidos, enVivo, finalizados, ligas: ligas.length };
}
