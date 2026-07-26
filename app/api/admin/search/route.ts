import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getPanelOrgIds, orgScopeWhere } from "@/lib/orgAuth";
import { playerOrgScopeWhere } from "@/lib/playerAuth";
import type { AdminSearchResult } from "@/types/admin-search";
import { apiError, apiOk } from "@/lib/apiResponse";

/**
 * GET /api/admin/search?q=… — buscador del command palette (F3).
 *
 * Devuelve torneos, equipos y jugadores que coinciden con el texto, **acotados
 * a las organizaciones del usuario** (`getPanelOrgIds`, N3): un organizador no
 * puede encontrar recursos de otra liga desde el buscador. Sin sesión ni
 * membresías → `orgIds` es `[]` → no matchea nada.
 *
 * Devuelve lo mínimo para pintar una fila y navegar (id, nombre, subtítulo):
 * el palette no es una vista, es un atajo.
 */

/** Techo por entidad: el palette muestra un puñado, no un listado. */
const LIMIT = 5;

// `AdminSearchResult` vive en `types/admin-search.ts`: lo consume el
// CommandPalette, y `components/` no puede importar desde `app/` (regla A1).
export type { AdminSearchResult };

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get("q")?.trim();
    if (!q || q.length < 2) {
      return apiOk([]);
    }

    const orgIds = await getPanelOrgIds();
    if (orgIds?.length === 0) {
      return apiOk([]);
    }

    const scope = orgScopeWhere(orgIds);
    const match = { contains: q, mode: "insensitive" as const };

    const [tournaments, teams, players] = await Promise.all([
      db.tournament.findMany({
        where: { ...scope, deletedAt: null, name: match },
        select: { id: true, name: true, locality: true, status: true },
        take: LIMIT,
        orderBy: { createdAt: "desc" },
      }),
      db.team.findMany({
        where: { ...scope, deletedAt: null, name: match },
        select: { id: true, name: true, homeCity: true, enabled: true },
        take: LIMIT,
        orderBy: { name: "asc" },
      }),
      // Los jugadores NO se acotan con `scope` (que filtra por
      // `organizationId`): la ficha es global y ese campo ya no existe (N12).
      // El equivalente es "juega en un torneo mío" — si no, el buscador del
      // panel expondría a todos los jugadores de la plataforma.
      db.player.findMany({
        where: { ...playerOrgScopeWhere(orgIds), deletedAt: null, name: match },
        select: { id: true, name: true, position: true, enabled: true },
        take: LIMIT,
        orderBy: { name: "asc" },
      }),
    ]);

    const results: AdminSearchResult[] = [
      ...tournaments.map((t) => ({
        id: t.id,
        type: "tournament" as const,
        title: t.name,
        subtitle: t.locality,
      })),
      ...teams.map((t) => ({
        id: t.id,
        type: "team" as const,
        title: t.name,
        // Un deshabilitado se sigue viendo (conserva su historial), pero hay que
        // poder distinguirlo de un equipo activo desde el resultado
        subtitle: t.enabled ? t.homeCity : "Deshabilitado",
      })),
      ...players.map((p) => ({
        id: p.id,
        type: "player" as const,
        title: p.name,
        subtitle: p.enabled ? p.position : "Deshabilitado",
      })),
    ];

    return apiOk(results);
  } catch (error) {
    console.error("Error en la búsqueda del panel:", error);
    return apiError(500, "Error al buscar");
  }
}
