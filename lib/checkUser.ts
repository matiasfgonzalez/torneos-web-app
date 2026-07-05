import { cache } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";

import { db } from "@/lib/db";

/**
 * Devuelve el usuario de BD correspondiente a la sesión de Clerk actual,
 * creándolo si es su primer acceso.
 *
 * - `cache()`: una sola query por request aunque se llame desde layout + page + componentes.
 * - `upsert` con `update: {}`: crea si no existe, devuelve el existente sin
 *   pisar datos gestionados por el admin/webhook (role, status, phone, bio).
 * - Maneja la race de dos requests simultáneas del primer login (P2002).
 */
export const checkUser = cache(async () => {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  const email = user.emailAddresses[0]?.emailAddress;
  if (!email) {
    // Sin email no se puede crear el usuario (campo unique/requerido)
    return null;
  }

  const name = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || null;

  // Bootstrap del administrador: el email configurado en ADMIN_EMAIL
  // recibe rol ADMINISTRADOR al crearse (post-reset de BD no hay admin)
  const isAdmin =
    !!process.env.ADMIN_EMAIL &&
    email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase();

  try {
    return await db.user.upsert({
      where: { clerkUserId: user.id },
      update: {},
      create: {
        clerkUserId: user.id,
        name,
        imageUrl: user.imageUrl,
        email,
        status: "ACTIVO",
        role: isAdmin ? "ADMINISTRADOR" : "USUARIO",
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      // Otra request creó el usuario en simultáneo: leerlo y devolverlo
      return db.user.findUnique({ where: { clerkUserId: user.id } });
    }
    throw error;
  }
});
