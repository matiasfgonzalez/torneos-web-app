"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { deleteImage } from "@/lib/cloudinary";
import { requireActionOrgAccess } from "@/lib/orgAuth";

/**
 * Baja de jugadores.
 *
 * Regla de negocio (2026-07-14): **el borrado físico solo se permite si el
 * jugador no tiene ninguna relación** — es decir, si se cargó y nunca se sumó
 * a un equipo en un torneo (cero `TeamPlayer`). Todo lo demás cuelga de
 * `TeamPlayer`: goles, asistencias, tarjetas y suspensiones. Y como esas FK
 * son `onDelete: Cascade`, borrar un jugador con historial borraría en
 * silencio los goles y tarjetas de partidos ya jugados, dejando la tabla de
 * posiciones y las estadísticas mintiendo.
 *
 * Cuando tiene historial, la baja es **lógica**: `enabled = false`. El jugador
 * se sigue viendo (panel, ficha pública, historial) pero deja de estar
 * disponible para sumarlo a un equipo.
 */

/** Valida acceso a la organización dueña del jugador. */
async function authForPlayer(playerId: string) {
  const player = await db.player.findUnique({
    where: { id: playerId },
    select: { organizationId: true },
  });
  if (!player) return { error: "Jugador no encontrado" as string };
  return requireActionOrgAccess(player.organizationId);
}

function revalidatePlayerPaths(id: string) {
  revalidatePath("/admin/jugadores");
  revalidatePath("/jugadores");
  revalidatePath(`/jugadores/${id}`);
}

/**
 * Elimina físicamente un jugador. Falla si tiene cualquier relación.
 *
 * El chequeo se hace **en el servidor** aunque la UI ya lo haya hecho: el
 * cliente pudo haber cargado la lista antes de que el jugador se sumara a un
 * equipo.
 */
export async function deletePlayer(id: string) {
  const auth = await authForPlayer(id);
  if (auth.error) return { success: false, error: auth.error };

  try {
    const player = await db.player.findUnique({
      where: { id },
      select: {
        name: true,
        imagePublicId: true,
        imageFacePublicId: true,
        _count: { select: { teamPlayer: true } },
      },
    });

    if (!player) return { success: false, error: "Jugador no encontrado" };

    if (player._count.teamPlayer > 0) {
      return {
        success: false,
        error:
          "Este jugador ya participó en un equipo: no se puede eliminar sin perder su historial. Deshabilitalo en su lugar.",
        hasRelations: true,
      };
    }

    await db.player.delete({ where: { id } });

    // Las imágenes quedarían huérfanas en Cloudinary. Si falla el borrado
    // remoto no revertimos el de la base: el jugador ya no existe y una imagen
    // colgada no rompe nada.
    for (const publicId of [player.imagePublicId, player.imageFacePublicId]) {
      if (!publicId) continue;
      try {
        await deleteImage(publicId);
      } catch (error) {
        console.error(`No se pudo borrar la imagen ${publicId}:`, error);
      }
    }

    revalidatePlayerPaths(id);
    return { success: true, message: `${player.name} fue eliminado` };
  } catch (error) {
    console.error("Error deleting player:", error);
    return { success: false, error: "Error al eliminar el jugador" };
  }
}

/**
 * Habilita/deshabilita un jugador (baja lógica). Conserva todos sus datos e
 * historial; solo deja de estar disponible para nuevas incorporaciones.
 */
export async function togglePlayerEnabled(id: string) {
  const auth = await authForPlayer(id);
  if (auth.error) return { success: false, error: auth.error };

  try {
    const player = await db.player.findUnique({
      where: { id },
      select: { enabled: true, deletedAt: true, name: true },
    });

    if (!player) return { success: false, error: "Jugador no encontrado" };
    if (player.deletedAt) {
      return { success: false, error: "El jugador está eliminado" };
    }

    const enabled = !player.enabled;

    await db.player.update({
      where: { id },
      data: {
        enabled,
        // Al deshabilitar, el estado deportivo pasa a NO_DISPONIBLE (no está
        // "activo" si no puede jugar). Al rehabilitar vuelve a ACTIVO.
        status: enabled ? "ACTIVO" : "NO_DISPONIBLE",
      },
    });

    revalidatePlayerPaths(id);
    return {
      success: true,
      enabled,
      message: enabled
        ? `${player.name} fue habilitado`
        : `${player.name} fue deshabilitado`,
    };
  } catch (error) {
    console.error("Error toggling player:", error);
    return { success: false, error: "Error al cambiar el estado del jugador" };
  }
}
