import StatsCards from "./components/StatsCards";
import PlayersTable from "./components/PlayersTable";
import PlayerForm from "./components/player-form";
import { getJugadores } from "@/app/actions/jugadores/getJugadores";

const teams = [
  {
    id: "87a0c06e-2b8d-4120-a57e-7c0d0ded9421",
    name: "Club Deportivo Águilas",
    logoUrl: "/placeholder.svg?height=32&width=32&text=🦅",
  },
  {
    id: "2",
    name: "Los Leones FC",
    logoUrl: "/placeholder.svg?height=32&width=32&text=🦁",
  },
  {
    id: "3",
    name: "Femenino Estrella",
    logoUrl: "/placeholder.svg?height=32&width=32&text=⭐",
  },
  {
    id: "4",
    name: "Tigres Unidos",
    logoUrl: "/placeholder.svg?height=32&width=32&text=🐅",
  },
];

export default async function AdminJugadores() {
  const players = await getJugadores();
  console.log(players);
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
      <PlayersTable players={players} teams={teams} />
    </div>
  );
}
