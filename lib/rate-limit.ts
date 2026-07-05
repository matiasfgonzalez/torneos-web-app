/**
 * Rate limiter en memoria (ventana fija) para el middleware.
 *
 * Sin dependencias ni servicios externos: cada instancia del server mantiene
 * sus propios contadores. Suficiente para frenar abuso/fuerza bruta en un
 * deploy de instancia única; en serverless multi-instancia el límite es
 * por instancia (mejor que nada). Si el hosting final es Vercel/serverless,
 * reemplazar la implementación por @upstash/ratelimit manteniendo esta firma.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

const MAX_BUCKETS = 10_000;

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetAt: number; // epoch ms en que se reinicia la ventana
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    // Limpieza perezosa para no crecer sin límite
    if (buckets.size >= MAX_BUCKETS) {
      for (const [k, b] of buckets) {
        if (b.resetAt <= now) buckets.delete(k);
      }
    }
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  bucket.count += 1;

  if (bucket.count > limit) {
    return { ok: false, remaining: 0, resetAt: bucket.resetAt };
  }

  return { ok: true, remaining: limit - bucket.count, resetAt: bucket.resetAt };
}
