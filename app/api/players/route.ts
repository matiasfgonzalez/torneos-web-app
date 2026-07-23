// app/api/players/route.ts
import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { checkUser } from "@/lib/checkUser";
import { getPanelOrgIds } from "@/lib/orgAuth";
import { getManagedTeamIds } from "@/lib/teamAuth";
import { logPlayerCreate, playerOrgScopeWhere } from "@/lib/playerAuth";
import { apiError } from "@/lib/apiResponse";
import { playerCreateSchema } from "@/lib/validators/player";
import { validationErrorResponse } from "@/lib/validators/common";

/**
 * Alta de ficha de jugador (N12/N13).
 *
 * La ficha es **global**: no pertenece a ninguna liga. La puede cargar cualquiera
 * que tenga un motivo para hacerlo — gestor de una liga o delegado de un equipo
 * aprobado — y el DNI, único en toda la plataforma, evita el duplicado.
 */
export async function POST(req: Request) {
  try {
    const user = await checkUser();
    if (!user) return apiError(401, "No autenticado");

    // Cargar fichas es de quien gestiona una liga o representa a un equipo.
    // Un USUARIO suelto no tiene por qué crear identidades de terceros.
    const [orgIds, managedTeamIds] = await Promise.all([
      getPanelOrgIds(user),
      getManagedTeamIds(user),
    ]);
    const canLoad =
      user.role === "ADMINISTRADOR" ||
      (orgIds?.length ?? 0) > 0 ||
      orgIds === null ||
      managedTeamIds.length > 0;

    if (!canLoad) {
      return apiError(403, "Necesitás gestionar una liga o representar a un equipo");
    }

    const parsed = playerCreateSchema.safeParse(await req.json());
    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    // El DNI ya existe → es la misma persona, no una ficha nueva. Se devuelve
    // 409 con el id para que la UI ofrezca asociarlo en vez de duplicarlo.
    const existing = await db.player.findUnique({
      where: { nationalId: parsed.data.nationalId },
      select: { id: true, name: true },
    });
    if (existing) {
      return NextResponse.json(
        {
          error: "Ya existe un jugador con ese DNI",
          existingPlayer: existing,
        },
        { status: 409 },
      );
    }

    const newPlayer = await db.player.create({
      data: { ...parsed.data, createdById: user.id },
    });

    await logPlayerCreate(user.id, newPlayer.id, parsed.data);

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
 * `?scope=panel` acota a los jugadores que **participan en los torneos** de las
 * organizaciones del usuario. Antes filtraba por `Player.organizationId`, que
 * ya no existe: la ficha es global (N12) y lo que hace "mío" a un jugador es
 * que juegue en un torneo mío, no quién lo cargó.
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
      if (orgIds?.length === 0) return NextResponse.json([]);
      Object.assign(where, playerOrgScopeWhere(orgIds));
    }

    // A3 + PII (M1/OWASP A01): este GET es **público**. Antes devolvía la fila
    // entera de cada jugador — incluido el **DNI** (`nationalId`), la bio y los
    // publicId internos de Cloudinary. Ahora `select` mínimo: solo lo que la
    // tarjeta pública, los filtros y el selector de plantel dibujan. El DNI y
    // los datos sensibles NO salen por acá; el detalle por id trae el resto.
    const players = await db.player.findMany({
      where,
      select: {
        id: true,
        name: true,
        imageUrl: true,
        imageUrlFace: true,
        nationality: true,
        birthPlace: true,
        position: true,
        number: true,
        status: true,
        dominantFoot: true,
        height: true,
        weight: true,
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(players);
  } catch (error) {
    console.error(error);
    return apiError(500, "Error obteniendo jugadores");
  }
}
