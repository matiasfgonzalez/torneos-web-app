// app/api/noticias/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db"; // Asegurate que esta ruta sea correcta

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const publishedParam = searchParams.get("published");

        // Solo incluir el filtro si viene el parámetro
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {};
        if (publishedParam !== null) {
            // Convertir string a booleano
            where.published = publishedParam === "true";
        }

        const noticias = await db.news.findMany({
            where,
            include: {
                user: true // Opcional: incluye los datos del usuario creador
            },
            orderBy: {
                createdAt: "desc"
            }
        });
        return NextResponse.json(noticias);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Error al obtener noticias" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const { title, summary, content, coverImageUrl, published } = body;

        if (!title || !content) {
            return NextResponse.json(
                { error: "Faltan campos obligatorios" },
                { status: 400 }
            );
        }

        // Get logged in user
        const { userId } = await auth();

        // Check for user
        if (!userId) {
            return NextResponse.json(
                { error: "Usuario no encontrado" },
                { status: 400 }
            );
        }

        // Get user from database
        const user = await db.user.findUnique({
            where: { clerkUserId: userId }
        });

        // Check if user exists
        if (!user) {
            return NextResponse.json(
                { error: "Usuario no encontrado" },
                { status: 404 }
            );
        }

        // Validar que el user sea admin
        const userLogued = await currentUser();
        if (!userLogued) {
            return NextResponse.json(
                { error: "Usuario no autenticado" },
                { status: 401 }
            );
        }
        const role = userLogued.publicMetadata?.role as string | null;
        if (role !== "admin") {
            return NextResponse.json(
                { error: "No tienes permisos para crear una noticia" },
                { status: 403 }
            );
        }

        const newNews = await db.news.create({
            data: {
                title,
                summary,
                content,
                coverImageUrl,
                published: published ?? false,
                userId: user.id
            }
        });

        return NextResponse.json(newNews, { status: 201 });
    } catch (error) {
        console.error("Error al crear noticia:", error);
        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
