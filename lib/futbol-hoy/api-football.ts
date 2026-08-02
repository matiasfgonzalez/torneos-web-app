import "server-only";

import { ZONA_HORARIA } from "./fecha";
import { erroresDeApi, mapearRespuesta } from "./mapeo";
import type { ApiFootballRespuesta, FilaFixture } from "./types";

/**
 * Cliente HTTP de API-Football (`v3.football.api-sports.io`).
 *
 * **Solo server.** El `import "server-only"` no es decorativo: la clave del
 * proveedor es un secreto de cuenta —no de usuario— y una sola importación
 * distraída desde un Client Component la publicaría en el bundle del navegador,
 * donde cualquiera podría gastarnos las 100 llamadas del día. Con esta línea,
 * ese import no compila.
 *
 * Este archivo hace **una sola cosa**: pedir y traducir. No decide cuándo
 * llamar (eso es `politica.ts`) ni guarda nada (eso es `sync.ts`).
 */

const BASE_URL = "https://v3.football.api-sports.io";

/**
 * Corte de páginas. `GET /fixtures?date=` normalmente devuelve la jornada
 * completa en una sola página, pero el sobre trae `paging` y una respuesta rara
 * con un `paging.total` gigante nos haría gastar la cuota entera en un bucle.
 * Tres páginas cubren cualquier día real con margen.
 */
const MAX_PAGINAS = 3;

/** Un proveedor lento no puede colgar el render de la página. */
const TIMEOUT_MS = 10_000;

/** ¿Está configurada la clave? Sin ella el módulo funciona, pero sin datos. */
export function hayClaveConfigurada(): boolean {
  return Boolean(process.env.FOOTBALL_API_KEY?.trim());
}

export interface ResultadoConsulta {
  /** Partidos ya mapeados. Vacío si hubo error. */
  filas: FilaFixture[];
  /**
   * Llamadas HTTP efectivamente hechas. **Se devuelve aunque haya error**: una
   * llamada fallida también le cuenta al proveedor, así que también tiene que
   * descontar del presupuesto.
   */
  requests: number;
  /** Mensaje del fallo, o null si salió bien. */
  error: string | null;
}

/** Una página pedida: o el cuerpo ya validado, o el motivo del fallo. */
type ResultadoPagina =
  | { cuerpo: ApiFootballRespuesta; error: null }
  | { cuerpo: null; error: string };

/**
 * Una sola página del endpoint. Aislada de la paginación para que cada función
 * tenga un problema: esta, el diálogo con el proveedor; la de abajo, cuántas
 * páginas pedir y cómo juntarlas.
 *
 * Se le pasa `timezone` a la API para que devuelva los partidos del **día
 * argentino**: sin ese parámetro el proveedor corta el día en UTC y los
 * partidos nocturnos de acá aparecen en la fecha siguiente.
 */
async function pedirPagina(
  clave: string,
  matchDay: string,
  pagina: number,
): Promise<ResultadoPagina> {
  const url = new URL("/fixtures", BASE_URL);
  url.searchParams.set("date", matchDay);
  url.searchParams.set("timezone", ZONA_HORARIA);
  if (pagina > 1) url.searchParams.set("page", String(pagina));

  let respuesta: Response;
  try {
    respuesta = await fetch(url, {
      headers: { "x-apisports-key": clave },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      // Es una llamada de sincronización: la caché la maneja nuestra BD, no el
      // fetch. Un `revalidate` acá escondería el consumo real de cuota.
      cache: "no-store",
    });
  } catch (e) {
    const causa = e instanceof Error ? e.message : String(e);
    return { cuerpo: null, error: `No se pudo contactar a API-Football: ${causa}` };
  }

  if (!respuesta.ok) {
    // 429 es el caso esperable y merece un mensaje propio: no es "se rompió",
    // es "se acabó la cuota", y son dos cosas distintas para quien lo lee.
    const detalle =
      respuesta.status === 429
        ? "se agotó la cuota del plan"
        : `respondió ${respuesta.status}`;
    return { cuerpo: null, error: `API-Football ${detalle}.` };
  }

  let cuerpo: ApiFootballRespuesta;
  try {
    cuerpo = (await respuesta.json()) as ApiFootballRespuesta;
  } catch {
    return { cuerpo: null, error: "API-Football devolvió un cuerpo ilegible." };
  }

  // ⚠️ El status HTTP no alcanza: con clave inválida o cuota agotada el
  // proveedor responde 200 con `errors` poblado y `response: []`.
  const error = erroresDeApi(cuerpo);
  if (error) return { cuerpo: null, error: `API-Football: ${error}` };

  return { cuerpo, error: null };
}

/**
 * Partidos de una fecha (`AAAA-MM-DD`).
 *
 * Nunca tira: devuelve el error como dato. Quien llama tiene que registrar el
 * intento igual (y descontar la cuota), y una excepción tentaría a saltear ese
 * paso en algún camino.
 */
export async function traerFixturesDelDia(
  matchDay: string,
): Promise<ResultadoConsulta> {
  const clave = process.env.FOOTBALL_API_KEY?.trim();
  if (!clave) {
    return {
      filas: [],
      requests: 0,
      error:
        "Falta FOOTBALL_API_KEY: no hay forma de consultar los partidos del día.",
    };
  }

  const filas: FilaFixture[] = [];
  let requests = 0;
  let pagina = 1;
  let totalPaginas = 1;

  while (pagina <= totalPaginas && pagina <= MAX_PAGINAS) {
    requests += 1;
    const resultado = await pedirPagina(clave, matchDay, pagina);
    if (resultado.error !== null) {
      return { filas, requests, error: resultado.error };
    }

    filas.push(...mapearRespuesta(resultado.cuerpo));

    const total = resultado.cuerpo.paging?.total;
    totalPaginas = typeof total === "number" && total > 0 ? total : 1;
    pagina += 1;
  }

  // `mapearRespuesta` deduplica dentro de una página; esto cierra el hueco
  // ENTRE páginas. Un `fixtureId` repetido en el lote haría fallar la escritura
  // masiva por clave duplicada — un error que solo aparece con volumen real.
  const porId = new Map(filas.map((f) => [f.fixtureId, f]));

  return { filas: [...porId.values()], requests, error: null };
}
