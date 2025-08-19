import Header from "./components/Header";
import QuickStats from "./components/QuickStats";
import { getTorneoById } from "@/app/actions/torneos/getTorneoById";
import TabsTournament from "./components/TabsTournament";
import { getEquipos } from "@/app/actions/equipos/getEquipos";
import { getTournamentTeams } from "@/app/actions/tournament-teams/getTournamentTeams";

export default async function AdminTournamentDetail({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;
  const torneo = await getTorneoById(id);
  const equipos = await getEquipos();
  const associations = await getTournamentTeams(id);

  if (torneo) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <Header tournamentData={torneo} />

        {/* Status and Quick Stats */}
        <QuickStats tournamentData={torneo} />

        {/* Tabs */}
        <TabsTournament
          tournamentData={torneo}
          equipos={equipos}
          associations={associations}
        />
      </div>
    );
  } else {
    return (
      <div className="space-y-6">
        <p>Torneo inexistente</p>
      </div>
    );
  }
}
