/**
 * Capa de datos del cliente unificada (M5).
 *
 * Antes había ~69 `fetch()` sueltos con el mismo boilerplate copiado y **manejo
 * de errores desigual**: unos chequeaban `res.ok`, otros no; unos leían
 * `err.error`, otros `err.message`, otros tragaban el error. Esto centraliza:
 * una sola forma de pegarle a la API, parsear la respuesta y sacar el mensaje
 * de error, con un resultado **tipado y discriminado** (`{ ok } | { ok:false }`)
 * como el resto del repo (`InscriptionResult`, `RuleResult`).
 *
 * **Decisión (M5):** NO se adoptó TanStack Query. El dolor real era la
 * inconsistencia del manejo de errores, no el cacheo: las lecturas pesadas ya
 * son server components y las mutaciones revalidan con `revalidatePath`. Sumar
 * React Query obligaría a un `QueryClientProvider` y a reescribir cada
 * componente de datos, a cambio de poco. Un cliente tipado da el 90% del
 * beneficio con una fracción del riesgo.
 *
 * El cliente **no muestra toasts**: devuelve el resultado y el que llama decide
 * el copy (`if (!res.ok) toast.error(res.error)`), que es como ya se usaba.
 *
 * La API responde con la convención de A7 (`lib/apiResponse.ts`): éxito = datos
 * directos; error = `{ error, details? }`. Las rutas de `users/*` conservan su
 * envelope `{ success, data, ... }` histórico: el cliente devuelve el JSON tal
 * cual y el que llama tipa `T` según corresponda.
 */

export interface ApiFieldError {
  path: string;
  message: string;
}

export type ApiResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      /** Mensaje listo para mostrar al usuario. */
      error: string;
      /** Status HTTP (0 = no hubo respuesta: red caída, CORS, etc.). */
      status: number;
      /** Errores por campo de una validación Zod (`validationErrorResponse`). */
      details?: ApiFieldError[];
      /** Body de error parseado, para campos propios de una ruta (ej. el
       *  `existingPlayer` del 409 de `/api/players`). `unknown`: castealo. */
      raw?: unknown;
    };

interface JsonErrorBody {
  error?: string;
  message?: string;
  details?: ApiFieldError[];
}

type Body = unknown;

async function request<T>(
  method: string,
  url: string,
  body?: Body,
  init?: RequestInit,
): Promise<ApiResult<T>> {
  let res: Response;
  try {
    res = await fetch(url, {
      method,
      // Solo mandamos content-type si hay body JSON. `FormData` se deja pasar
      // tal cual (el navegador pone su propio boundary) — no se serializa.
      headers:
        body !== undefined && !(body instanceof FormData)
          ? { "Content-Type": "application/json", ...(init?.headers ?? {}) }
          : init?.headers,
      body:
        body === undefined
          ? undefined
          : body instanceof FormData
            ? body
            : JSON.stringify(body),
      ...init,
    });
  } catch {
    // No hubo respuesta: red caída, offline, DNS, etc.
    return {
      ok: false,
      error: "No se pudo conectar con el servidor. Revisá tu conexión.",
      status: 0,
    };
  }

  // 204/empty: no hay cuerpo que parsear.
  const text = await res.text().catch(() => "");
  let json: unknown = null;
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }
  }

  if (!res.ok) {
    const err = (json ?? {}) as JsonErrorBody;
    return {
      ok: false,
      error: err.error ?? err.message ?? `Error ${res.status}`,
      status: res.status,
      details: err.details,
      raw: json,
    };
  }

  return { ok: true, data: json as T };
}

/**
 * Cliente HTTP tipado. Devuelve un `ApiResult<T>` — nunca tira. Uso:
 *
 * ```ts
 * const res = await api.post<Match>("/api/matches", payload);
 * if (!res.ok) { toast.error(res.error); return; }
 * usar(res.data);
 * ```
 */
export const api = {
  get: <T>(url: string, init?: RequestInit) =>
    request<T>("GET", url, undefined, init),
  post: <T>(url: string, body?: Body, init?: RequestInit) =>
    request<T>("POST", url, body, init),
  patch: <T>(url: string, body?: Body, init?: RequestInit) =>
    request<T>("PATCH", url, body, init),
  put: <T>(url: string, body?: Body, init?: RequestInit) =>
    request<T>("PUT", url, body, init),
  del: <T = void>(url: string, init?: RequestInit) =>
    request<T>("DELETE", url, undefined, init),
};
