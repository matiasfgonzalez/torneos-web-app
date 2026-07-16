/** Nombres de grupo: A, B, C… (26 grupos es más de lo que cualquier torneo real usa). */
export const groupName = (index: number): string =>
  String.fromCharCode(65 + index);

/**
 * Reparte equipos en grupos **balanceados** (S1).
 *
 * Reparto en serpiente (1→A, 2→B, 3→C, 4→C, 5→B, 6→A…) y no por bloques
 * (A,A,B,B): si la lista viene sembrada por nivel —y en un sorteo con bombos
 * viene—, cortar por bloques mete a los cuatro mejores en el mismo grupo. La
 * serpiente los distribuye.
 *
 * Con equipos que no dividen exacto, los primeros grupos quedan con uno más:
 * 7 equipos en 2 grupos → A=4, B=3. Eso es correcto y el round-robin de cada
 * grupo lo resuelve solo (el grupo impar genera un descanso por fecha).
 */
export function distributeIntoGroups(
  teamIds: readonly string[],
  groupCount: number,
): string[][] {
  if (groupCount < 1) throw new Error("Se necesita al menos un grupo");
  if (groupCount > teamIds.length) {
    throw new Error("Hay más grupos que equipos");
  }

  const groups: string[][] = Array.from({ length: groupCount }, () => []);

  teamIds.forEach((teamId, index) => {
    const row = Math.floor(index / groupCount);
    const position = index % groupCount;
    // Filas impares se recorren al revés: eso es la serpiente
    const target = row % 2 === 0 ? position : groupCount - 1 - position;
    groups[target].push(teamId);
  });

  return groups;
}
