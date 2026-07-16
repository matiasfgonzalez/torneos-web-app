import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { checkUser } from "@/lib/checkUser";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import {
  getMyRosters,
  getMyTeamRequests,
  getOpenOrganizations,
} from "@modules/delegados/actions/queries";
import { getOpenTournamentsForMyTeams } from "@modules/delegados/actions/inscriptions";
import MiEquipoClient from "./MiEquipoClient";

export const metadata: Metadata = {
  title: "Mi equipo | GOLAZO",
};

/**
 * Área del delegado (N13).
 *
 * Deliberadamente chica: no es `/admin`. El delegado no es miembro de la liga,
 * así que no ve nada de ella — solo sus propios equipos.
 */
export default async function MiEquipoPage() {
  const user = await checkUser();
  if (!user) redirect("/sign-in");

  const [requests, organizations, rosters, openTournaments] = await Promise.all([
    getMyTeamRequests(),
    getOpenOrganizations(),
    getMyRosters(),
    getOpenTournamentsForMyTeams(),
  ]);

  return (
    <div className="flex min-h-screen flex-col premium-gradient-bg">
      <Header isLogued />
      <main className="mx-auto w-full max-w-3xl flex-grow px-4 py-10">
        <MiEquipoClient
          requests={requests.map((r) => ({
            id: r.id,
            status: r.status,
            team: {
              id: r.team.id,
              name: r.team.name,
              logoUrl: r.team.logoUrl,
              homeCity: r.team.homeCity,
              enabled: r.team.enabled,
              organizationName: r.team.organization.name,
              tournamentCount: r.team._count.tournamentTeams,
            },
          }))}
          organizations={organizations}
          rosters={rosters}
          openTournaments={openTournaments}
        />
      </main>
      <Footer />
    </div>
  );
}
