// app/api/noticias/route.ts
import { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db"; // Asegurate que esta ruta sea correcta
import { validateApiRole } from "@/lib/apiRoleValidation";
import { newsCreateSchema } from "@/lib/validators/news";
import { validationErrorResponse } from "@/lib/validators/common";
import { newsAuthorSelect } from "@modules/noticias/authorSelect";
import { apiError, apiOk } from "@/lib/apiResponse";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const publishedParam = searchParams.get("published");

    // Solo incluir el filtro si viene el parámetro
    const where: Prisma.NewsWhereInput = { deletedAt: null };
    if (publishedParam !== null) {
      // Convertir string a booleano
      where.published = publishedParam === "true";
    }

    // A3: `select` sin `content`. El listado solo muestra título, resumen,
    // portada, autor y fechas; mandar el cuerpo completo de CADA noticia era
    // payload muerto (a veces varios KB por fila). El detalle sí lo trae, por id.
    const noticias = await db.news.findMany({
      where,
      select: {
        id: true,
        title: true,
        summary: true,
        coverImageUrl: true,
        published: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
        user: newsAuthorSelect, // autor sin PII (M1) — GET público
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return apiOk(noticias);
  } catch (error) {
    console.error(error);
    return apiError(500, "Error al obtener noticias");
  }
}

export async function POST(req: NextRequest) {
  // Noticias globales de la plataforma: solo ADMINISTRADOR (decisión D5)
  const authResult = await validateApiRole(["ADMINISTRADOR"]);
  if (authResult.error) {
    return authResult.error;
  }

  try {
    const body = await req.json();

    const parsed = newsCreateSchema.safeParse(body);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    const published = parsed.data.published ?? false;
    const newNews = await db.news.create({
      data: {
        ...parsed.data,
        published,
        // A6: `publishedAt` se setea SOLO al publicar; un borrador queda en null.
        publishedAt: published ? new Date() : null,
        userId: authResult.user!.id,
      },
    });

    return apiOk(newNews, 201);
  } catch (error) {
    console.error("Error al crear noticia:", error);
    return apiError(500, "Error interno del servidor");
  }
}
