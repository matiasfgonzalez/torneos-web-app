// app/api/players/route.ts
import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import {
  getPanelOrgIds,
  orgScopeWhere,
  requireApiOrgContext,
} from "@/lib/orgAuth";
import { apiError } from "@/lib/apiResponse";
import { playerCreateSchema } from "@/lib/validators/player";
import { validationErrorResponse } from "@/lib/validators/common";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const auth = await requireApiOrgContext();
    if (auth.error) {
      return auth.error;
    }

    const parsed = playerCreateSchema.safeParse(body);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    const newPlayer = await db.player.create({
      data: {
        ...parsed.data,
        organizationId: auth.org.id,
      },
    });

    return NextResponse.json(newPlayer, { status: 201 });
  } catch (error) {
    console.error(error);
    return apiError(500, "Error al crear el jugador");
  }
}

/**
 * Listado de jugadores **disponibles**: nunca devuelve deshabilitados ni
 * eliminados. De acá salen tanto el listado público como el selector de
 * "agregar jugador al equipo" — y un jugador dado de baja no se puede sumar a
 * ningún equipo, esa es justamente la diferencia entre deshabilitar y eliminar.
 *
 * `?scope=panel` acota a las organizaciones del usuario (el selector del panel);
 * sin el parámetro devuelve el listado público de difusión (todas las ligas).
 */
export async function GET(req: Request) {
  try {
    const scope = new URL(req.url).searchParams.get("scope");

    const where: Prisma.PlayerWhereInput = {
      enabled: true,
      deletedAt: null,
    };

    if (scope === "panel") {
      const orgIds = await getPanelOrgIds();
      Object.assign(where, orgScopeWhere(orgIds));
    }

    const players = await db.player.findMany({ where });
    return NextResponse.json(players);
  } catch (error) {
    console.error(error);
    return apiError(500, "Error obteniendo jugadores");
  }
}
