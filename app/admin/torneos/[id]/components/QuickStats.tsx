import { ITorneo } from "@/components/torneos/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/formatDate";
import { Users, Trophy, Target, Clock, Building } from "lucide-react";

interface PropsQuickStats {
  tournamentData: ITorneo;
}

const getStatusBadge = (status: string, statusLabel: string) => {
  switch (status) {
    case "EN_CURSO":
      return <Badge variant="default">{statusLabel}</Badge>;
    case "FINALIZADO":
      return <Badge variant="secondary">{statusLabel}</Badge>;
    case "PENDIENTE":
      return <Badge variant="outline">{statusLabel}</Badge>;
    case "CANCELADO":
    case "SUSPENDIDO":
      return <Badge variant="destructive">{statusLabel}</Badge>;
    default:
      return <Badge>{statusLabel}</Badge>;
  }
};

const QuickStats = (props: PropsQuickStats) => {
  const { tournamentData } = props;
  return (
    <div className="grid gap-4 md:grid-cols-5">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Estado</CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {getStatusBadge(tournamentData.status, tournamentData.status)}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Equipos</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {tournamentData.tournamentTeams?.length}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Partidos</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {tournamentData.matches}/{tournamentData.matches?.length}
          </div>
          <p className="text-xs text-muted-foreground">completados</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Próximo Partido</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-sm font-medium">
            {tournamentData.nextMatch
              ? formatDate(tournamentData.nextMatch)
              : "No programado"}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Liga / Asociación
          </CardTitle>
          <Building className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-sm font-medium">{tournamentData.liga}</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickStats;
