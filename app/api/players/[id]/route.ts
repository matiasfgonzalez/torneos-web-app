// app/api/players/[id]/route.ts
import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";
import { checkUser } from "@/lib/checkUser";
import { canEditPlayer, logPlayerChange } from "@/lib/playerAuth";
import { playerUpdateSchema } from "@/lib/validators/player";
import { validationErrorResponse } from "@/lib/validators/common";

type tParams = Promise<{ id: string }>;

/**
 * Edita la ficha de un jugador (N12/N13).
 *
 * El permiso ya no sale de `Player.organizationId` —la ficha es global y no
 * tiene dueño— sino de la **participación**: puede editarla quien la creó,
 * el delegado que tiene al jugador en su plantel o la liga en cuyos torneos
 * juega (ver `lib/playerAuth.ts`).
 *
 * Cualquier delegado con el jugador en su plantel puede editar (decisión del
 * owner), así que **todo cambio queda registrado en `AuditLog`** con quién lo
 * hizo y qué valores tocó.
 */
export async function PATCH(req: NextRequest, { params }: { params: tParams }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "ID no proporcionado" },
        { status: 400 },
      );
    }

    const user = await checkUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const existing = await db.player.findUnique({ where: { id } });

    if (!existing || existing.deletedAt) {
      return NextResponse.json(
        { error: "Jugador no encontrado" },
        { status: 404 },
      );
    }

    if (!(await canEditPlayer(user, id))) {
      return NextResponse.json(
        { error: "No podés editar este jugador" },
        { status: 403 },
      );
    }

    const parsed = playerUpdateSchema.safeParse(await req.json());
    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    // Cambiar el DNI es cambiar de identidad: si ya hay otra ficha con ese
    // documento, son la misma persona cargada dos veces y hay que fusionarlas
    // a mano, no pisar el índice único con un 500 de Prisma.
    if (parsed.data.nationalId && parsed.data.nationalId !== existing.nationalId) {
      const other = await db.player.findUnique({
        where: { nationalId: parsed.data.nationalId },
        select: { id: true, name: true },
      });
      if (other && other.id !== id) {
        return NextResponse.json(
          {
            error: `Ya existe otro jugador con ese DNI (${other.name}).`,
            existingPlayer: other,
          },
          { status: 409 },
        );
      }
    }

    const updatedPlayer = await db.player.update({
      where: { id },
      data: parsed.data,
    });

    await logPlayerChange(user.id, id, existing, updatedPlayer);

    return NextResponse.json(updatedPlayer, { status: 200 });
  } catch (error) {
    console.error("Error en PATCH /api/players:", error);
    return NextResponse.json(
      { error: "Error al actualizar el jugador" },
      { status: 500 },
    );
  }
}
