import StatsCards from "./components/StatsCards";
import PlayersTable from "./components/PlayersTable";
import PlayerForm from "./components/player-form";
import { getJugadores } from "@/app/actions/jugadores/getJugadores";

export default async function AdminJugadores() {
  const players = await getJugadores();
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Gestión de Jugadores
          </h2>
          <p className="text-muted-foreground">
            Administra todos los jugadores registrados en la plataforma
          </p>
        </div>

        {/* Formulario de Creación */}
        <PlayerForm isEditMode={false} />
      </div>

      {/* Stats Cards */}
      <StatsCards players={players} />

      {/* Players Table */}
      <PlayersTable players={players} />
    </div>
  );
}
