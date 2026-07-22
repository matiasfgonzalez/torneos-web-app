/**
 * Catálogo único de las features gateadas por plan.
 *
 * **Por qué existe (bug 2026-07-22).** `orgNews` se agregó en S12 al validador,
 * a la pantalla de planes y al enforcement… pero **no al seed**. Como
 * `hasFeature` devuelve `false` ante una clave ausente, la feature quedó
 * apagada para *todos los planes*, Premium incluido: el organizador pagaba
 * Premium y `/admin/novedades` le decía "función de plan superior". El error no
 * daba ningún síntoma en desarrollo — no rompe, no loguea, simplemente niega.
 *
 * Con este catálogo la lista deja de estar copiada en tres lugares (validador,
 * seed y llamadas sueltas a `hasFeature`): agregar una feature es sumar una
 * entrada acá, y `FeatureKey` hace que un nombre inventado sea un error de
 * compilación en vez de un `false` silencioso.
 */

export const PLAN_FEATURES = {
  exportPdf: {
    label: "Exportar a PDF",
    description: "Tabla de posiciones y fixture con la marca de la liga.",
  },
  customBranding: {
    label: "Marca propia",
    description: "Logo y color de la liga en su página pública.",
  },
  liveMatch: {
    label: "Partido en vivo",
    description: "El público ve el marcador actualizarse solo.",
  },
  orgNews: {
    label: "Novedades de la liga",
    description: "Publicar novedades en la página pública de la liga.",
  },
} as const;

export type FeatureKey = keyof typeof PLAN_FEATURES;

/** Todas las claves, para recorrerlas sin olvidarse ninguna. */
export const FEATURE_KEYS = Object.keys(PLAN_FEATURES) as FeatureKey[];

/**
 * Completa un objeto de features con las claves que falten, en `false`.
 *
 * Un plan guardado antes de que existiera una feature no la tiene en su JSON;
 * sin esto, la feature nueva queda apagada aunque el plan debiera incluirla, y
 * el toggle de `/admin/planes` no la muestra.
 */
export function withAllFeatures(
  features: Record<string, boolean> | null | undefined,
): Record<FeatureKey, boolean> {
  const completo = {} as Record<FeatureKey, boolean>;
  for (const key of FEATURE_KEYS) {
    completo[key] = features?.[key] === true;
  }
  return completo;
}
