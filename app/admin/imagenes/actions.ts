"use server";

import { revalidatePath } from "next/cache";
import { requireActionRole } from "@/lib/actionRoleValidation";
import { deleteOrphans } from "@/lib/cloudinary-orphans";

/**
 * Borra assets huérfanos de Cloudinary (M9). Solo ADMINISTRADOR de plataforma:
 * el listado abarca TODAS las organizaciones, así que no es una acción de org.
 * El borrado es irreversible; `deleteOrphans` re-verifica que sigan sin estar
 * referenciados antes de tocar Cloudinary.
 */
export async function deleteOrphanImages(publicIds: string[]) {
  const auth = await requireActionRole(["ADMINISTRADOR"]);
  if (auth.error) return { success: false as const, error: auth.error };

  if (!Array.isArray(publicIds) || publicIds.length === 0) {
    return { success: false as const, error: "No se seleccionaron imágenes" };
  }

  try {
    const result = await deleteOrphans(publicIds);
    revalidatePath("/admin/imagenes");
    return { success: true as const, ...result };
  } catch (error) {
    console.error("Error al borrar imágenes huérfanas:", error);
    return { success: false as const, error: "Error al borrar las imágenes" };
  }
}
