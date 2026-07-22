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
/**
 * Agrupa equipos por el grupo que **ya tienen asignado**, sin sortear nada.
 *
 * Para cuando el sorteo lo hizo la liga y no el sistema: bombos, un acto
 * público, o —el caso que lo motivó— cargar los grupos reales del Mundial a
 * mano. Sin esto, `distributeIntoGroups` reparte por su cuenta y **pisa** esa
 * asignación, y peor todavía: los partidos salen armados sobre los grupos
 * nuevos, así que corregir los grupos después no arregla el fixture.
 *
 * Los grupos se devuelven ordenados por nombre y los equipos en el orden
 * recibido, para que el resultado sea reproducible.
 */
export function groupByExisting(
  teamIds: readonly string[],
  groupOf: Readonly<Record<string, string>>,
): { name: string; teamIds: string[] }[] {
  const sinGrupo = teamIds.filter((id) => !groupOf[id]?.trim());
  if (sinGrupo.length > 0) {
    throw new Error(
      `Hay ${sinGrupo.length} ${
        sinGrupo.length === 1 ? "equipo sin grupo asignado" : "equipos sin grupo asignado"
      }. Asignáselo antes de generar, o dejá que el sistema sortee.`,
    );
  }

  const porGrupo = new Map<string, string[]>();
  for (const id of teamIds) {
    const name = groupOf[id].trim();
    porGrupo.set(name, [...(porGrupo.get(name) ?? []), id]);
  }

  const chicos = [...porGrupo.entries()].filter(([, ids]) => ids.length < 2);
  if (chicos.length > 0) {
    throw new Error(
      `El grupo "${chicos[0][0]}" tiene un solo equipo: no se pueden armar partidos. Revisá la asignación.`,
    );
  }

  return [...porGrupo.entries()]
    .sort(([a], [b]) => a.localeCompare(b, "es"))
    .map(([name, ids]) => ({ name, teamIds: ids }));
}

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
