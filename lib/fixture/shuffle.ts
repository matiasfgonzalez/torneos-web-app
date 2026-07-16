/**
 * Sorteo reproducible (S1).
 *
 * `Math.random()` haría que el mismo torneo diera un fixture distinto en cada
 * llamada y que los tests fueran una lotería. Con una semilla explícita, el
 * mismo input da siempre el mismo fixture: los tests son estables y el
 * organizador puede repetir un sorteo si algo salió mal.
 *
 * mulberry32: PRNG de 32 bits, corto y de distribución suficiente para ordenar
 * equipos. No es criptográfico y no tiene por qué serlo.
 */
export function makeRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Fisher-Yates sobre una copia. Sin semilla no mezcla: devolver el orden de
 * inscripción es preferible a un sorteo que no se puede repetir.
 */
export function shuffle<T>(items: readonly T[], seed?: number): T[] {
  const result = [...items];
  if (seed === undefined) return result;

  const random = makeRandom(seed);
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
