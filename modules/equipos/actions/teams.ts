"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { deleteImage } from "@/lib/cloudinary";
import { requireActionOrgAccess } from "@/lib/orgAuth";

/**
 * Baja de equipos.
 *
 * Regla de negocio (2026-07-14), espejo de la de jugadores: **el borrado
 * físico solo se permite si el equipo no está inscripto en ningún torneo**
 * (cero `TournamentTeam`). De `TournamentTeam` cuelgan los planteles
 * (`TeamPlayer` → goles, tarjetas, suspensiones), las estadísticas de la tabla
 * de posiciones y los partidos. Con `onDelete: Cascade` en el medio, borrar un
 * equipo con historial arrastraría todo eso.
 *
 * Con historial, la baja es **lógica**: `enabled = false`. El equipo se sigue
 * viendo en el panel y su historial queda intacto, pero deja de estar
 * disponible para inscribirlo en un torneo nuevo y sale del listado público.
 *
 * Los favoritos (`Favorite`) NO cuentan como relación que bloquee: no son
 * historial deportivo, y su FK ya cascadea sola.
 */

/** Valida acceso a la organización dueña del equipo. */
async function authForTeam(teamId: string) {
  const team = await db.team.findUnique({
    where: { id: teamId },
    select: { organizationId: true },
  });
  if (!team) return { error: "Equipo no encontrado" as string };
  return requireActionOrgAccess(team.organizationId);
}

function revalidateTeamPaths(id: string) {
  revalidatePath("/admin/equipos");
  revalidatePath("/equipos");
  revalidatePath(`/equipos/${id}`);
}

/**
 * Elimina físicamente un equipo. Falla si está inscripto en algún torneo.
 * El chequeo se rehace en el servidor: el cliente puede tener la lista vieja.
 */
export async function deleteTeam(id: string) {
  const auth = await authForTeam(id);
  if (auth.error) return { success: false, error: auth.error };

  try {
    const team = await db.team.findUnique({
      where: { id },
      select: {
        name: true,
        logoPublicId: true,
        _count: { select: { tournamentTeams: true } },
      },
    });

    if (!team) return { success: false, error: "Equipo no encontrado" };

    if (team._count.tournamentTeams > 0) {
      return {
        success: false,
        error:
          "Este equipo ya participó en un torneo: no se puede eliminar sin perder su historial. Deshabilitalo en su lugar.",
        hasRelations: true,
      };
    }

    await db.team.delete({ where: { id } });

    if (team.logoPublicId) {
      try {
        await deleteImage(team.logoPublicId);
      } catch (error) {
        console.error(`No se pudo borrar el logo ${team.logoPublicId}:`, error);
      }
    }

    revalidateTeamPaths(id);
    return { success: true, message: `${team.name} fue eliminado` };
  } catch (error) {
    console.error("Error deleting team:", error);
    return { success: false, error: "Error al eliminar el equipo" };
  }
}

/**
 * Habilita/deshabilita un equipo (baja lógica). Conserva plantel, estadísticas
 * e historial de partidos; solo deja de poder inscribirse en torneos nuevos y
 * sale del listado público.
 */
export async function toggleTeamEnabled(id: string) {
  const auth = await authForTeam(id);
  if (auth.error) return { success: false, error: auth.error };

  try {
    const team = await db.team.findUnique({
      where: { id },
      select: { enabled: true, deletedAt: true, name: true },
    });

    if (!team) return { success: false, error: "Equipo no encontrado" };
    if (team.deletedAt) {
      return { success: false, error: "El equipo está eliminado" };
    }

    const enabled = !team.enabled;

    await db.team.update({ where: { id }, data: { enabled } });

    revalidateTeamPaths(id);
    return {
      success: true,
      enabled,
      message: enabled
        ? `${team.name} fue habilitado`
        : `${team.name} fue deshabilitado`,
    };
  } catch (error) {
    console.error("Error toggling team:", error);
    return { success: false, error: "Error al cambiar el estado del equipo" };
  }
}
