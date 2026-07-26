import { NextResponse } from "next/server";

/**
 * Convención **única** de respuestas de la API (A7, cerrada el 2026-07-25).
 *
 * - **Éxito con datos:** los datos directos — `apiOk(entidad)` / `apiOk(lista)`.
 *   Listas vacías devuelven `[]`, nunca un `{ message }`.
 * - **Éxito de una lista paginada:** `apiOk({ data, meta })`.
 * - **Éxito sin datos** (un DELETE que no devuelve nada): `apiNoContent()` → 204.
 * - **Error:** `{ error, details? }` con el status HTTP correcto (`apiError`).
 *   Nunca texto plano, nunca un 200 que por dentro dice que falló.
 *
 * **Por qué NO hay envelope `{ success, data }`.** El plan original lo daba por
 * pendiente, y `users/*` llegó a tenerlo. Se decidió al revés, por tres razones
 * que se pagaban en cada pantalla:
 *
 * 1. **Duplica lo que ya modela el transporte.** El éxito o fracaso lo dice el
 *    status HTTP, y del lado del cliente `lib/api-client.ts` ya devuelve un
 *    `ApiResult<T>` discriminado (`{ ok: true, data } | { ok: false, error }`).
 *    Con envelope, el que llama desenvuelve dos veces.
 * 2. **Producía errores que no parecen errores.** Un `200` con
 *    `{ success: false }` pasa como éxito para cualquier manejo genérico: el
 *    código tenía que escribir `res.ok && res.data.success && res.data.data`
 *    para leer un dato, y `res.ok ? res.data.message : res.error` para mostrar
 *    un error. Tres condiciones para lo que ahora es `if (res.ok)`.
 * 3. **Era 4 rutas contra 42.** El resto del repo ya respondía con los datos
 *    directos; migrar hacia el envelope era rehacer lo que ya funcionaba.
 *
 * El motivo por el que se había postergado ("se hace en el rewrite de rutas de
 * N1/N2") venció: N1 y N2 están terminadas.
 *
 * ⚠️ **Esto NO aplica a los server actions.** Un action devuelve un objeto plano
 * al que lo llama, sin status HTTP que cargue el resultado, así que ahí el
 * `{ success, error }` discriminado es la forma correcta (la misma familia que
 * `RuleResult` o `InscriptionResult`). No unificarlos con esto.
 */

export function apiOk<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

/**
 * Éxito sin cuerpo (204). Para los DELETE que no tienen nada útil que devolver:
 * antes cada uno inventaba su `{ message: "X eliminado" }`, que ningún cliente
 * leía porque el copy del toast lo escribe la pantalla.
 *
 * `api-client` ya lo contempla: no intenta parsear un body vacío.
 */
export function apiNoContent() {
  return new NextResponse(null, { status: 204 });
}

/**
 * Error: `{ error, details?, ...extra }` con el status correcto.
 *
 * `details` es para los errores por campo de una validación Zod (los que
 * `api-client` expone como `res.details`). `extra` es para los datos propios de
 * un error de dominio que la UI necesita para reaccionar — el caso real es el
 * 409 de `POST /api/players`, que devuelve el `existingPlayer` para ofrecer
 * "sumalo al plantel" en vez de duplicar la ficha (`api-client` lo entrega en
 * `res.raw`). Sin este parámetro, esas rutas tenían que armar la respuesta a
 * mano y quedaban fuera de la convención.
 */
export function apiError(
  status: number,
  error: string,
  details?: unknown,
  extra?: Record<string, unknown>,
) {
  const body: Record<string, unknown> = { error, ...extra };
  if (details !== undefined) body.details = details;
  return NextResponse.json(body, { status });
}
