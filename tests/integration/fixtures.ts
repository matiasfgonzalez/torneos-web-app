import type { PrismaClient } from "@/lib/generated/prisma/client";

/**
 * Datos mínimos para los tests de integración: una liga con un torneo y N
 * equipos inscriptos. Nada de seeds gigantes — cada test arma lo que necesita y
 * `limpiarBase` lo borra después.
 */

let n = 0;
const unico = (p: string) => `${p}-${Date.now()}-${n++}`;

export interface Liga {
  orgId: string;
  tournamentId: string;
  /** Ids de `TournamentTeam` (que es lo que referencian los partidos). */
  equipos: string[];
}

export async function crearLiga(
  db: PrismaClient,
  opciones: { equipos?: number; nombre?: string } = {},
): Promise<Liga> {
  const cantidad = opciones.equipos ?? 4;
  const nombre = opciones.nombre ?? "Liga de prueba";

  const owner = await db.user.create({
    data: { clerkUserId: unico("clerk"), email: `${unico("owner")}@test.local` },
  });

  const org = await db.organization.create({
    data: { name: nombre, slug: unico("liga"), ownerId: owner.id },
  });

  const tournament = await db.tournament.create({
    data: {
      name: `${nombre} — Apertura`,
      locality: "Rafaela",
      startDate: new Date("2026-03-01"),
      organizationId: org.id,
    },
  });

  const equipos: string[] = [];
  for (let i = 0; i < cantidad; i++) {
    const team = await db.team.create({
      data: { name: `Equipo ${i + 1}`, organizationId: org.id },
    });
    const tt = await db.tournamentTeam.create({
      data: { tournamentId: tournament.id, teamId: team.id },
    });
    equipos.push(tt.id);
  }

  return { orgId: org.id, tournamentId: tournament.id, equipos };
}

/** Partido FINALIZADO con marcador, listo para contar en la tabla. */
export async function crearPartido(
  db: PrismaClient,
  liga: Liga,
  local: number,
  visitante: number,
  golesLocal: number,
  golesVisitante: number,
) {
  return db.match.create({
    data: {
      dateTime: new Date("2026-03-08T20:00:00Z"),
      tournamentId: liga.tournamentId,
      homeTeamId: liga.equipos[local],
      awayTeamId: liga.equipos[visitante],
      homeScore: golesLocal,
      awayScore: golesVisitante,
      status: "FINALIZADO",
    },
  });
}

/** Las cifras de la tabla, ordenadas, para comparar dos caminos de cálculo. */
export async function tabla(db: PrismaClient, tournamentId: string) {
  const filas = await db.tournamentTeam.findMany({
    where: { tournamentId },
    select: {
      id: true,
      matchesPlayed: true,
      wins: true,
      draws: true,
      losses: true,
      goalsFor: true,
      goalsAgainst: true,
      goalDifference: true,
      points: true,
    },
    orderBy: { id: "asc" },
  });
  return filas;
}
