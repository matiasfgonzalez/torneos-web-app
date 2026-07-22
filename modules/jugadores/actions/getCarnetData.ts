"use server";

import { db } from "@/lib/db";

/**
 * Datos del carnet digital y su verificación pública (N12).
 *
 * La página `/verificar/[id]` es pública (la abre la cámara de cualquiera que
 * escanee el QR en la cancha), así que devuelve lo MÍNIMO para confirmar
 * identidad y habilitación: foto, nombre, DNI enmascarado, equipos en torneos
 * vigentes y suspensiones activas. El veredicto se calcula acá (server) para
 * que el cliente no pueda maquillarlo.
 */

/** Estados de torneo en los que un carnet tiene sentido en la cancha. */
const TORNEOS_VIGENTES = ["INSCRIPCION", "PENDIENTE", "ACTIVO"] as const;

export type CarnetVerdict = "HABILITADO" | "NO_HABILITADO" | "REVISAR";

export interface CarnetData {
  playerId: string;
  name: string;
  /** DNI completo — SOLO para el carnet del dueño; la página pública usa maskedDni. */
  nationalId: string;
  maskedDni: string;
  photoUrl: string | null;
  position: string | null;
  status: string;
  verdict: CarnetVerdict;
  /** Motivo legible cuando el veredicto no es verde. */
  verdictDetail: string | null;
  teams: {
    teamName: string;
    teamLogoUrl: string | null;
    tournamentName: string;
    number: number | null;
  }[];
  suspensions: {
    tournamentName: string;
    reason: string;
    remaining: number;
  }[];
  /** Cuándo se consultó (el veredicto es una foto del momento). */
  checkedAt: Date;
}

/** `12345678` → `••.•••.678` — suficiente para cotejar con el DNI físico. */
function maskDni(dni: string): string {
  const last3 = dni.slice(-3);
  return `••.•••.${last3}`;
}

export async function getCarnetData(
  playerId: string,
): Promise<CarnetData | null> {
  const player = await db.player.findFirst({
    where: { id: playerId, deletedAt: null },
    select: {
      id: true,
      name: true,
      nationalId: true,
      imageUrlFace: true,
      imageUrl: true,
      position: true,
      status: true,
      enabled: true,
      teamPlayer: {
        where: {
          tournamentTeam: {
            tournament: {
              deletedAt: null,
              status: { in: [...TORNEOS_VIGENTES] },
            },
          },
        },
        select: {
          number: true,
          tournamentTeam: {
            select: {
              team: { select: { name: true, logoUrl: true } },
              tournament: { select: { name: true } },
            },
          },
          suspensions: {
            where: { isActive: true },
            select: {
              reason: true,
              totalMatches: true,
              servedMatches: true,
              tournament: { select: { name: true } },
            },
          },
        },
      },
    },
  });

  if (!player) return null;

  const suspensions = player.teamPlayer.flatMap((tp) =>
    tp.suspensions.map((s) => ({
      tournamentName: s.tournament.name,
      reason: s.reason,
      remaining: Math.max(0, s.totalMatches - s.servedMatches),
    })),
  );

  // Veredicto (server-side, el cliente solo lo pinta):
  // - rojo: suspendido/expulsado o con suspensión vigente
  // - verde: habilitado, activo y sin sanciones
  // - ámbar: cualquier otro estado (lesionado, retirado, deshabilitado...) —
  //   no es un "no" automático, pero el árbitro tiene que mirar.
  let verdict: CarnetVerdict;
  let verdictDetail: string | null = null;

  if (
    suspensions.length > 0 ||
    player.status === "SUSPENDIDO" ||
    player.status === "EXPULSADO"
  ) {
    verdict = "NO_HABILITADO";
    verdictDetail =
      suspensions.length > 0
        ? `Suspensión vigente: ${suspensions
            .map((s) => `${s.remaining} fecha(s) en ${s.tournamentName}`)
            .join(" · ")}`
        : `Estado de la ficha: ${player.status}`;
  } else if (player.enabled && player.status === "ACTIVO") {
    verdict = "HABILITADO";
  } else {
    verdict = "REVISAR";
    verdictDetail = !player.enabled
      ? "La ficha está deshabilitada por su liga"
      : `Estado de la ficha: ${player.status}`;
  }

  return {
    playerId: player.id,
    name: player.name,
    nationalId: player.nationalId,
    maskedDni: maskDni(player.nationalId),
    photoUrl: player.imageUrlFace ?? player.imageUrl,
    position: player.position,
    status: player.status,
    verdict,
    verdictDetail,
    teams: player.teamPlayer.map((tp) => ({
      teamName: tp.tournamentTeam.team.name,
      teamLogoUrl: tp.tournamentTeam.team.logoUrl,
      tournamentName: tp.tournamentTeam.tournament.name,
      number: tp.number,
    })),
    suspensions,
    checkedAt: new Date(),
  };
}
