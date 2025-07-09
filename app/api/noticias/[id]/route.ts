// app/api/noticias/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        if (!id) {
            return NextResponse.json(
                { error: "ID no proporcionado" },
                { status: 400 }
            );
        }

        const noticia = await db.news.findUnique({
            where: { id },
            include: {
                user: true // Opcional: incluye los datos del usuario creador
            }
        });

        if (!noticia) {
            return NextResponse.json(
                { error: "Noticia no encontrada" },
                { status: 404 }
            );
        }

        return NextResponse.json(noticia, { status: 200 });
    } catch (error) {
        console.error("Error al obtener noticia por ID:", error);
        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
