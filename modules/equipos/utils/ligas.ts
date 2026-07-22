/**
 * Ligas distintas en las que participa un club (M14).
 *
 * Un mismo club puede jugar en varias ligas y sus estadísticas las suman todas,
 * así que la ficha pública tiene que poder decir de dónde sale cada torneo.
 *
 * Vive acá y no dentro del componente porque el contenido de esa pestaña **no
 * se renderiza en el servidor** (Radix monta solo la pestaña activa), así que
 * no se puede verificar con un request: separada, la parte con lógica —quitar
 * las repetidas conservando el orden— se testea sola.
 */

export interface LigaDelEquipo {
  name: string;
  slug: string;
}

interface ConOrganizacion {
  tournament: { organization: LigaDelEquipo | null };
}

/**
 * Quita las ligas repetidas conservando el orden de aparición: un club que
 * jugó tres torneos de la misma liga la muestra una sola vez.
 */
export function ligasDelEquipo(
  tournamentTeams: readonly ConOrganizacion[],
): LigaDelEquipo[] {
  const porSlug = new Map<string, LigaDelEquipo>();

  for (const tt of tournamentTeams) {
    const org = tt.tournament.organization;
    if (org && !porSlug.has(org.slug)) {
      porSlug.set(org.slug, org);
    }
  }

  return [...porSlug.values()];
}
