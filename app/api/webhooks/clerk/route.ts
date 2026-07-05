import { NextRequest, NextResponse } from "next/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

/**
 * Webhook de Clerk — sincroniza usuarios Clerk ↔ BD.
 *
 * Eventos manejados:
 * - user.created  → upsert del usuario (email, nombre, foto, emailVerified)
 * - user.updated  → actualiza SOLO datos que gestiona Clerk (no pisa role/status/phone/bio)
 * - user.deleted  → baja lógica (isActive: false, status: INACTIVO)
 * - session.created → actualiza lastLoginAt
 *
 * La firma se valida con svix vía verifyWebhook (secret: CLERK_WEBHOOK_SECRET).
 * El middleware excluye /api/webhooks de sesión y rate limiting.
 */

type ClerkEmailAddress = {
  id: string;
  email_address: string;
  verification?: { status?: string } | null;
};

type ClerkUserData = {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  image_url?: string | null;
  email_addresses?: ClerkEmailAddress[];
  primary_email_address_id?: string | null;
};

function extractUserFields(data: ClerkUserData) {
  const primaryEmail =
    data.email_addresses?.find((e) => e.id === data.primary_email_address_id) ??
    data.email_addresses?.[0];

  const name =
    `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim() || null;

  return {
    email: primaryEmail?.email_address ?? null,
    emailVerified: primaryEmail?.verification?.status === "verified",
    name,
    imageUrl: data.image_url ?? null,
  };
}

export async function POST(req: NextRequest) {
  let evt;
  try {
    evt = await verifyWebhook(req, {
      signingSecret: process.env.CLERK_WEBHOOK_SECRET,
    });
  } catch (error) {
    console.error("Webhook de Clerk con firma inválida:", error);
    return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
  }

  try {
    switch (evt.type) {
      case "user.created": {
        const data = evt.data as ClerkUserData;
        const fields = extractUserFields(data);

        if (!fields.email) {
          // Sin email no se puede crear (email es unique/requerido en BD)
          console.error(`user.created sin email (clerkUserId: ${data.id})`);
          break;
        }

        await db.user.upsert({
          where: { clerkUserId: data.id },
          update: {
            email: fields.email,
            emailVerified: fields.emailVerified,
            name: fields.name,
            imageUrl: fields.imageUrl,
          },
          create: {
            clerkUserId: data.id,
            email: fields.email,
            emailVerified: fields.emailVerified,
            name: fields.name,
            imageUrl: fields.imageUrl,
            status: "ACTIVO",
          },
        });
        break;
      }

      case "user.updated": {
        const data = evt.data as ClerkUserData;
        const fields = extractUserFields(data);

        await db.user.updateMany({
          where: { clerkUserId: data.id },
          data: {
            ...(fields.email ? { email: fields.email } : {}),
            emailVerified: fields.emailVerified,
            name: fields.name,
            imageUrl: fields.imageUrl,
          },
        });
        break;
      }

      case "user.deleted": {
        const clerkUserId = (evt.data as { id?: string }).id;
        if (!clerkUserId) break;

        await db.user.updateMany({
          where: { clerkUserId },
          data: {
            isActive: false,
            status: "INACTIVO",
          },
        });
        break;
      }

      case "session.created": {
        const clerkUserId = (evt.data as { user_id?: string }).user_id;
        if (!clerkUserId) break;

        // updateMany: no falla si el usuario todavía no existe en BD
        // (session.created puede llegar antes que user.created)
        await db.user.updateMany({
          where: { clerkUserId },
          data: { lastLoginAt: new Date() },
        });
        break;
      }

      default:
        // Evento no manejado: 200 igual para que Clerk no reintente
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      // Conflicto de unicidad (ej. email ya usado por un usuario temp_ creado
      // a mano): reintentar no lo resuelve — log y 200 para cortar los retries
      console.error(`Webhook ${evt.type}: conflicto de unicidad`, error.meta);
      return NextResponse.json({ received: true, warning: "conflict" });
    }

    console.error(`Error procesando webhook ${evt.type}:`, error);
    // 500 → Clerk reintenta con backoff
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
