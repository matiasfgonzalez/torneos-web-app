// app/api/noticias/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateApiRole } from "@/lib/apiRoleValidation";
import { newsUpdateSchema } from "@/lib/validators/news";
import { validationErrorResponse } from "@/lib/validators/common";

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

    if (!id) {
      return NextResponse.json(
        { error: "ID no proporcionado" },
        { status: 400 },
      );
    }

    // Validate that only ADMINISTRADOR or EDITOR can update news
    const authResult = await validateApiRole(["ADMINISTRADOR", "EDITOR"]);
    if (authResult.error) {
      return authResult.error;
    }

    const parsed = newsUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    const updatedNoticia = await db.news.update({
      where: { id },
      data: parsed.data,
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

    // Validate that only ADMINISTRADOR or EDITOR can delete news
    const authResult = await validateApiRole(["ADMINISTRADOR", "EDITOR"]);
    if (authResult.error) {
      return authResult.error;
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
