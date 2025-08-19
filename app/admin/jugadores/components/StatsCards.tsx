import { IPlayer } from "@/components/jugadores/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Users, Activity, UserX } from "lucide-react";

interface PropsStatsCards {
  players: IPlayer[];
}

const StatsCards = (props: PropsStatsCards) => {
  const { players } = props;
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Jugadores</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{players.length}</div>
          <p className="text-xs text-muted-foreground">
            Registrados en la plataforma
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Activos</CardTitle>
          <Activity className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {players.filter((p) => p.status === "ACTIVE").length}
          </div>
          <p className="text-xs text-muted-foreground">
            Disponibles para jugar
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Suspendidos</CardTitle>
          <UserX className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {players.filter((p) => p.status === "SUSPENDED").length}
          </div>
          <p className="text-xs text-muted-foreground">No pueden participar</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Goles</CardTitle>
          <Award className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">
            {players.reduce(
              (sum, player) => sum + (player.goals ? player.goals.length : 0),
              0
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            En la temporada actual
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;
