"use server";

import { db } from "@/lib/db";
import { checkUser } from "@/lib/checkUser";
import { getPanelOrgIds } from "@/lib/orgAuth";

/**
 * Buscar equipos de **otras ligas** para inscribirlos en un torneo propio
 * (decisión de producto 2026-07-22: poseer un equipo y poder usarlo son cosas
 * distintas).
 *
 * Es el espejo de `searchTeamsToClaim` (`modules/delegados/actions/queries.ts`),
 * que ya buscaba equipos en todas las ligas del lado del delegado. Acá se le da
 * la misma capacidad al organizador, que era el único que había quedado atado a
 * ver únicamente lo suyo y por eso terminaba recreando clubes que ya existían.
 *
 * **Buscar no es editar**: el equipo lo sigue administrando su liga dueña (y su
 * delegado, si tiene). Ver `PATCH /api/teams/[id]`.
 */

export interface SharedTeam {
  id: string;
  name: string;
  homeCity: string | null;
  logoUrl: string | null;
  /** Liga que lo tiene cargado. Se muestra para no confundir homónimos. */
  organizationName: string;
  /** Si tiene delegado aprobado, el organizador debería saberlo antes de usarlo. */
  hasDelegate: boolean;
  /** `true` si ya pertenece a alguna de las ligas del usuario. */
  isOwn: boolean;
}

export async function searchTeamsAcrossLeagues(
  query: string,
): Promise<SharedTeam[]> {
  const user = await checkUser();
  if (!user) return [];

  // Solo para quien gestiona alguna liga: un usuario suelto no tiene por qué
  // barrer el padrón de clubes de toda la plataforma.
  const orgIds = await getPanelOrgIds();
  if (orgIds !== null && orgIds.length === 0) return [];

  const term = query.trim();
  if (term.length < 2) return [];

  const teams = await db.team.findMany({
    where: {
      deletedAt: null,
      // Un equipo deshabilitado conserva su historial pero no se inscribe.
      enabled: true,
      name: { contains: term, mode: "insensitive" },
      organization: { status: "ACTIVA" },
    },
    select: {
      id: true,
      name: true,
      homeCity: true,
      logoUrl: true,
      organizationId: true,
      organization: { select: { name: true } },
      managers: {
        where: { status: "APROBADO" },
        select: { id: true },
        take: 1,
      },
    },
    orderBy: { name: "asc" },
    take: 20,
  });

  return teams.map((t) => ({
    id: t.id,
    name: t.name,
    homeCity: t.homeCity,
    logoUrl: t.logoUrl,
    organizationName: t.organization.name,
    hasDelegate: t.managers.length > 0,
    isOwn: orgIds === null || orgIds.includes(t.organizationId),
  }));
}
