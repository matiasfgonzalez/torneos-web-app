"use client";
import { ITorneo } from "@/components/torneos/types";
import { TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, Plus, Search, Clock, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import DialogAddEditMatch from "../DialogAddEditMatch";
import { IPartidos } from "@/components/partidos/types";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDateOk } from "@/lib/formatDate";
import { MatchStatus } from "@/types/match";

interface TabsTournamentProps {
  tournamentData: ITorneo;
}

const TabsMatches = (props: TabsTournamentProps) => {
  const { tournamentData } = props;
  const [matches, setMatches] = useState<IPartidos[] | []>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMatches = matches.filter(
    (match) =>
      match.homeTeam.team.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      match.awayTeam.team.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      match.tournament.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: MatchStatus) => {
    switch (status) {
      case MatchStatus.PROGRAMADO:
        return <Badge variant="outline">Programado</Badge>;

      case MatchStatus.EN_JUEGO:
        return <Badge variant="default">En curso</Badge>;

      case MatchStatus.ENTRETIEMPO:
        return <Badge variant="secondary">Entretiempo</Badge>;

      case MatchStatus.FINALIZADO:
        return <Badge variant="secondary">Finalizado</Badge>;

      case MatchStatus.SUSPENDIDO:
        return <Badge variant="destructive">Suspendido</Badge>;

      case MatchStatus.POSTERGADO:
        return <Badge variant="outline">Postergado</Badge>;

      case MatchStatus.CANCELADO:
        return <Badge variant="destructive">Cancelado</Badge>;

      case MatchStatus.WALKOVER:
        return <Badge variant="destructive">Walkover</Badge>;

      default:
        return <Badge>{status}</Badge>;
    }
  };

  useEffect(() => {
    // LLamar a la API matches
    const fetchMatches = async () => {
      try {
        const response = await fetch(
          `/api/matches/tournament/${tournamentData.id}`
        );
        const data: IPartidos[] = await response.json();
        setMatches(data);
        console.log(matches);
      } catch (error) {
        console.error("Error fetching matches:", error);
      }
    };
    fetchMatches();
  }, []);

  return (
    <TabsContent value="matches" className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Gestión de Partidos</h3>
          <p className="text-sm text-muted-foreground">
            {matches?.length} partidos programados
          </p>
        </div>
        <DialogAddEditMatch mode="create" tournamentData={tournamentData} />
      </div>

      {/* Lista de partidos */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Lista de Partidos</CardTitle>
            <CardDescription>
              Gestiona todos los partidos programados y finalizados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar partidos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Partido</TableHead>
                    <TableHead>Torneo</TableHead>
                    <TableHead>Fecha y Hora</TableHead>
                    <TableHead>Estadio</TableHead>
                    <TableHead>Resultado</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMatches.map((match) => (
                    <TableRow key={match.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center justify-center gap-3 font-medium text-center">
                            <img
                              src={
                                match.homeTeam.team.logoUrl ||
                                "/placeholder.svg?height=48&width=48&query=torneo-logo"
                              }
                              alt={`Logo ${match.homeTeam.team.name}`}
                              className="w-12 h-12 object-cover"
                            />
                            {match.homeTeam.team.shortName} vs{" "}
                            {match.awayTeam.team.shortName}
                            <img
                              src={
                                match.awayTeam.team.logoUrl ||
                                "/placeholder.svg?height=48&width=48&query=torneo-logo"
                              }
                              alt={`Logo ${match.awayTeam.team.name}`}
                              className="w-12 h-12 object-cover"
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{match.tournament.name}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2 text-sm">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {formatDateOk(match.dateTime, "dd 'de' MMMM yyyy")}
                          </span>
                          <Clock className="h-4 w-4" />
                          <span>{formatDateOk(match.dateTime, "HH:mm")}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <MapPin className="mr-1 h-4 w-4" />
                          {match.stadium}
                        </div>
                      </TableCell>
                      <TableCell>
                        {match.status === "FINALIZADO" ? (
                          <div className="font-bold text-lg">
                            {match.homeScore} - {match.awayScore}
                          </div>
                        ) : match.status === "EN_JUEGO" ? (
                          <div className="font-bold text-lg text-green-600">
                            {match.homeScore} - {match.awayScore}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(match.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <DialogAddEditMatch
                            mode="edit"
                            tournamentData={tournamentData}
                            matchData={match}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estado vacío mejorado (cuando no hay partidos) */}
      {matches.length === 0 && (
        <div className="bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-12 text-center">
          <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            No hay partidos programados
          </h3>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            Comienza creando tu primer partido. Podrás programar encuentros,
            registrar resultados y gestionar el fixture completo.
          </p>
          <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Programar primer partido
          </button>
        </div>
      )}
    </TabsContent>
  );
};

export default TabsMatches;
