"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { checkUser } from "@/lib/checkUser";
import { getManagedTeamIds, requireActionTeamManager } from "@/lib/teamAuth";
import { logPlayerCreate } from "@/lib/playerAuth";
import { nationalIdSchema } from "@/lib/validators/player";

/**
 * Alta y asociación de jugadores por el delegado (N12/N13).
 *
 * El orden del flujo lo define el negocio: el equipo se inscribe a un torneo
 * (crea el `TournamentTeam`), después se cargan las fichas, y recién ahí se
 * arma el plantel de ese torneo (`TeamPlayer`). La ficha es global y se carga
 * una sola vez: el mismo jugador puede estar en varios torneos.
 */

export type PlayerActionResult =
  | { success: true; message?: string; playerId?: string }
  | { success: false; error: string };

/**
 * Busca una ficha **por DNI exacto**.
 *
 * A propósito no busca por nombre ni por coincidencia parcial: con identidad
 * global, un buscador difuso sería una guía de datos personales de toda la
 * plataforma (Ley 25.326). Quien tiene el documento del jugador en la mano ya
 * sabe el DNI; quien no, no puede pescar. Devuelve lo mínimo para confirmar
 * identidad, no la ficha completa.
 */
export async function findPlayerByNationalId(rawDni: string): Promise<
  | { found: false }
  | {
      found: true;
      player: { id: string; name: string; position: string | null };
      /** Ya está en el plantel de este equipo-torneo. */
      alreadyInRoster: boolean;
    }
  | { error: string }
> {
  const user = await checkUser();
  if (!user) return { error: "Necesitás iniciar sesión" };

  const parsed = nationalIdSchema.safeParse(rawDni);
  if (!parsed.success) return { error: "Revisá el DNI" };

  const player = await db.player.findUnique({
    where: { nationalId: parsed.data },
    select: { id: true, name: true, position: true, deletedAt: true },
  });

  if (!player || player.deletedAt) return { found: false };

  return {
    found: true,
    player: { id: player.id, name: player.name, position: player.position },
    alreadyInRoster: false,
  };
}

/** Crea la ficha global de un jugador. El DNI evita el duplicado. */
export async function createPlayerAsManager(input: {
  nationalId: string;
  name: string;
  birthDate?: string;
  position?: string;
}): Promise<PlayerActionResult> {
  const user = await checkUser();
  if (!user) return { success: false, error: "Necesitás iniciar sesión" };

  // Solo un delegado aprobado carga fichas por esta vía
  const managedTeamIds = await getManagedTeamIds(user);
  if (managedTeamIds.length === 0) {
    return { success: false, error: "No representás a ningún equipo" };
  }

  const dni = nationalIdSchema.safeParse(input.nationalId);
  if (!dni.success) {
    return { success: false, error: "Revisá el DNI: solo números, sin puntos" };
  }
  if (input.name.trim().length < 3) {
    return { success: false, error: "El nombre es muy corto" };
  }

  const existing = await db.player.findUnique({
    where: { nationalId: dni.data },
    select: { id: true, name: true },
  });
  if (existing) {
    return {
      success: false,
      error: `Ese DNI ya pertenece a ${existing.name}. Buscalo por DNI y sumalo a tu plantel en vez de cargarlo de nuevo.`,
    };
  }

  const player = await db.player.create({
    data: {
      nationalId: dni.data,
      name: input.name.trim(),
      birthDate: input.birthDate ? new Date(input.birthDate) : null,
      position: (input.position as never) || null,
      createdById: user.id,
    },
  });

  await logPlayerCreate(user.id, player.id, {
    name: player.name,
    nationalId: player.nationalId,
  });

  revalidatePath("/mi-equipo");
  return { success: true, playerId: player.id, message: `${player.name} quedó cargado.` };
}

/**
 * Suma un jugador al plantel de un equipo en un torneo.
 *
 * Dos reglas del negocio que el schema **no** garantizaba:
 * 1. El mismo jugador no puede estar en dos equipos del **mismo torneo** — el
 *    único índice existente (`[playerId, tournamentTeamId]`) solo evitaba
 *    cargarlo dos veces en el *mismo* equipo, así que podía terminar jugando
 *    contra sí mismo y sumando goles para los dos lados.
 * 2. Sí puede estar en varios torneos distintos (misma ficha, otro plantel).
 */
export async function addPlayerToRoster(input: {
  tournamentTeamId: string;
  playerId: string;
  number?: number;
  position?: string;
}): Promise<PlayerActionResult> {
  const tournamentTeam = await db.tournamentTeam.findUnique({
    where: { id: input.tournamentTeamId },
    select: {
      id: true,
      teamId: true,
      tournamentId: true,
      team: { select: { name: true } },
    },
  });
  if (!tournamentTeam) {
    return { success: false, error: "El equipo no está inscripto en ese torneo" };
  }

  const auth = await requireActionTeamManager(tournamentTeam.teamId);
  if (auth.error) return { success: false, error: auth.error };

  const player = await db.player.findUnique({
    where: { id: input.playerId },
    select: { id: true, name: true, enabled: true, deletedAt: true },
  });
  if (!player || player.deletedAt) {
    return { success: false, error: "El jugador no existe" };
  }
  if (!player.enabled) {
    return { success: false, error: `${player.name} está dado de baja` };
  }

  // Regla 1: ¿ya juega este torneo en otro equipo?
  const inTournament = await db.teamPlayer.findFirst({
    where: {
      playerId: input.playerId,
      tournamentTeam: { tournamentId: tournamentTeam.tournamentId },
    },
    select: {
      tournamentTeam: { select: { id: true, team: { select: { name: true } } } },
    },
  });

  if (inTournament) {
    if (inTournament.tournamentTeam.id === tournamentTeam.id) {
      return { success: false, error: `${player.name} ya está en tu plantel` };
    }
    return {
      success: false,
      error: `${player.name} ya juega este torneo en ${inTournament.tournamentTeam.team.name}. Un jugador no puede estar en dos equipos del mismo torneo.`,
    };
  }

  await db.teamPlayer.create({
    data: {
      tournamentTeamId: tournamentTeam.id,
      playerId: input.playerId,
      number: input.number ?? null,
      position: input.position || null,
    },
  });

  revalidatePath("/mi-equipo");
  return {
    success: true,
    message: `${player.name} se sumó al plantel de ${tournamentTeam.team.name}.`,
  };
}

/** Saca un jugador del plantel de un torneo. */
export async function removePlayerFromRoster(
  teamPlayerId: string,
): Promise<PlayerActionResult> {
  const teamPlayer = await db.teamPlayer.findUnique({
    where: { id: teamPlayerId },
    select: {
      id: true,
      player: { select: { name: true } },
      tournamentTeam: { select: { teamId: true } },
      _count: { select: { goals: true, cards: true } },
    },
  });
  if (!teamPlayer) return { success: false, error: "No está en el plantel" };

  const auth = await requireActionTeamManager(teamPlayer.tournamentTeam.teamId);
  if (auth.error) return { success: false, error: auth.error };

  // Con goles o tarjetas ya cargados, sacarlo se los lleva puestos
  // (`onDelete: Cascade`) y deja la tabla mintiendo — misma regla que §8b.
  if (teamPlayer._count.goals > 0 || teamPlayer._count.cards > 0) {
    return {
      success: false,
      error: `${teamPlayer.player.name} ya tiene goles o tarjetas en este torneo. Pedile a la liga que lo dé de baja del plantel.`,
    };
  }

  await db.teamPlayer.delete({ where: { id: teamPlayerId } });

  revalidatePath("/mi-equipo");
  return { success: true, message: `${teamPlayer.player.name} salió del plantel.` };
}
