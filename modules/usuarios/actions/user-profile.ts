"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { checkUser } from "@/lib/checkUser";
import { z } from "zod";

const ProfileSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  bio: z.string().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
});

export type ProfileFormState = {
  errors?: {
    name?: string[];
    bio?: string[];
    phone?: string[];
    location?: string[];
    _form?: string[];
  };
  message?: string;
  success?: boolean;
};

export async function updateUserProfile(
  prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const user = await checkUser();

  if (!user) {
    return {
      message: "No autenticado",
    };
  }

  const validatedFields = ProfileSchema.safeParse({
    name: formData.get("name"),
    bio: formData.get("bio"),
    phone: formData.get("phone"),
    location: formData.get("location"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Error de validación. Revisa los campos.",
    };
  }

  const { name, bio, phone, location } = validatedFields.data;

  try {
    await db.user.update({
      where: { id: user.id },
      data: {
        name,
        bio,
        phone,
        location,
      },
    });

    revalidatePath("/profile");
    
    return {
      success: true,
      message: "Perfil actualizado correctamente",
    };
  } catch (error) {
    console.error("Error updating profile:", error);
    return {
      message: "Error al actualizar la base de datos",
    };
  }
}

