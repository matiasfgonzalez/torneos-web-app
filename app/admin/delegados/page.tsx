import type { Metadata } from "next";

import { validatePanelAccess } from "@/lib/roleValidation";
import { checkUser } from "@/lib/checkUser";
import { getOrCreateOwnOrg } from "@/lib/orgAuth";
import { getPendingTeamRequests } from "@modules/delegados/actions/requests";
import { getPendingInscriptions } from "@modules/delegados/actions/inscriptions";
import DelegadosClient from "./DelegadosClient";

export const metadata: Metadata = {
  title: "Delegados | GOLAZO Admin",
};

/**
 * Bandeja de solicitudes de delegado (N13).
 *
 * La liga decide quién representa a cada uno de sus equipos: sin esta
 * aprobación, cualquiera se declararía delegado de cualquier equipo.
 */
export default async function DelegadosPage() {
  await validatePanelAccess();

  const user = await checkUser();
  const org = user ? await getOrCreateOwnOrg(user) : null;
  const [requests, inscriptions] = org
    ? await Promise.all([
        getPendingTeamRequests(org.id),
        getPendingInscriptions(org.id),
      ])
    : [[], []];

  return (
    <DelegadosClient
      inscriptions={inscriptions.map((i) => ({
        id: i.id,
        teamName: i.team.name,
        tournamentName: i.tournament.name,
        playerCount: i._count.teamPlayer,
      }))}
      requests={requests.map((r) => ({
        id: r.id,
        message: r.message,
        createdAt: r.createdAt.toISOString(),
        user: {
          name: r.user.name,
          email: r.user.email,
        },
        team: {
          name: r.team.name,
          homeCity: r.team.homeCity,
          // Un equipo deshabilitado en una solicitud pendiente es una propuesta
          // nueva; uno habilitado es un reclamo sobre un equipo que ya existía.
          isProposal: !r.team.enabled,
        },
      }))}
    />
  );
}
