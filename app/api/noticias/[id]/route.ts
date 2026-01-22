// app/api/noticias/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { checkUser } from "@/lib/checkUser";
import { db } from "@/lib/db";

type tParams = Promise<{ id: string }>;

export async function GET(req: NextRequest, { params }: { params: tParams }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "ID no proporcionado" },
        { status: 400 },
      );
    }

    const noticia = await db.news.findUnique({
      where: { id },
      include: {
        user: true, // Opcional: incluye los datos del usuario creador
      },
    });

    if (!noticia) {
      return NextResponse.json(
        { error: "Noticia no encontrada" },
        { status: 404 },
      );
    }

    return NextResponse.json(noticia, { status: 200 });
  } catch (error) {
    console.error("Error al obtener noticia por ID:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest, { params }: { params: tParams }) {
  try {
    // Await params before accessing its properties
    const { id } = await params;
    const body = await req.json();

    const { title, summary, content, coverImageUrl, published } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID no proporcionado" },
        { status: 400 },
      );
    }

    // Validar que el user sea admin
    const userLogued = await checkUser();
    if (!userLogued) {
      return NextResponse.json(
        { error: "Usuario no autenticado" },
        { status: 401 },
      );
    }

    if (userLogued.role !== "ADMINISTRADOR") {
      return NextResponse.json(
        { error: "No tienes permisos para actualizar una noticia" },
        { status: 403 },
      );
    }

    const updatedNoticia = await db.news.update({
      where: { id },
      data: {
        title,
        summary,
        content,
        coverImageUrl,
        published,
        updatedAt: new Date(),
      },
      include: { user: true },
    });

    return NextResponse.json(updatedNoticia, { status: 200 });
  } catch (error) {
    console.error("Error al actualizar la noticia:", error);
    return NextResponse.json(
      { error: "Error al actualizar la noticia" },
      { status: 500 },
    );
  }
}

// DELETE: Eliminar una noticia por ID
export async function DELETE(
  req: NextRequest,
  { params }: { params: tParams },
) {
  try {
    // Await params before accessing its properties
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "ID no proporcionado" },
        { status: 400 },
      );
    }

    // Validar que el user sea admin
    const userLogued = await checkUser();
    if (!userLogued) {
      return NextResponse.json(
        { error: "Usuario no autenticado" },
        { status: 401 },
      );
    }

    if (userLogued.role !== "ADMINISTRADOR") {
      return NextResponse.json(
        { error: "No tienes permisos para eliminar una noticia" },
        { status: 403 },
      );
    }

    const deletedNoticia = await db.news.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Noticia eliminada correctamente", deletedNoticia },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error al eliminar la noticia:", error);
    return NextResponse.json(
      { error: "Error al eliminar la noticia" },
      { status: 500 },
    );
  }
}
