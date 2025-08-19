import { ITeam } from "@/components/equipos/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users } from "lucide-react";

interface PropsStatsCards {
  teams: ITeam[];
}

const StatsCards = (props: PropsStatsCards) => {
  const { teams } = props;
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Equipos</CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{teams.length}</div>
          <p className="text-xs text-muted-foreground">Equipos registrados</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Activos</CardTitle>
          <Users className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {teams.filter((t) => t.enabled === true).length}
          </div>
          <p className="text-xs text-muted-foreground">En competencia</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Deshabilitados</CardTitle>
          <Users className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {teams.filter((t) => t.enabled === false).length}
          </div>
          <p className="text-xs text-muted-foreground">
            No habilitados para seleccionar
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Jugadores</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {teams.reduce(
              (sum, team) => sum + (team.teamPlayer || []).length,
              0
            )}
          </div>
          <p className="text-xs text-muted-foreground">Jugadores registrados</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;
