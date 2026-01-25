"use client";
import { ITorneo } from "@modules/torneos/types";
import { TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, Plus, Search, Clock, MapPin, Target } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import DialogAddEditMatch from "../DialogAddEditMatch";
import DialogMatchDetails from "../DialogMatchDetails";
import { IPartidos, MatchStatus } from "@modules/partidos/types";
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
      match.tournament.name.toLowerCase().includes(searchTerm.toLowerCase()),
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

  const fetchMatches = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/matches/tournament/${tournamentData.id}`,
      );
      const data: IPartidos[] = await response.json();
      setMatches(data);
    } catch (error) {
      console.error("Error fetching matches:", error);
    }
  }, [tournamentData.id]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  return (
    <TabsContent value="matches" className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-[#ad45ff] to-[#c77dff] rounded-xl shadow-lg shadow-[#ad45ff]/25">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Gestión de Partidos
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {matches?.length} partidos programados
            </p>
          </div>
        </div>
        <DialogAddEditMatch
          mode="create"
          tournamentData={tournamentData}
          onSuccess={fetchMatches}
        />
      </div>

      {/* Lista de partidos */}
      <div className="space-y-6">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#ad45ff] via-[#c77dff] to-[#a3b3ff] rounded-3xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300" />
          <Card className="relative bg-white dark:bg-gray-900 border-0 shadow-2xl rounded-2xl overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-[#ad45ff] via-[#c77dff] to-[#a3b3ff]" />
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-[#ad45ff] to-[#c77dff] rounded-xl shadow-lg shadow-[#ad45ff]/25">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                    Lista de Partidos
                  </CardTitle>
                  <CardDescription className="text-gray-500 dark:text-gray-400">
                    Gestiona todos los partidos programados y finalizados
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar partidos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-[#ad45ff] focus:border-[#ad45ff]"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <Table>
                  <TableHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/80">
                    <TableRow className="border-b border-gray-200 dark:border-gray-700 hover:bg-transparent">
                      <TableHead className="font-bold text-gray-900 dark:text-white">
                        Partido
                      </TableHead>
                      <TableHead className="font-bold text-gray-900 dark:text-white hidden md:table-cell">
                        Torneo
                      </TableHead>
                      <TableHead className="font-bold text-gray-900 dark:text-white hidden lg:table-cell">
                        Fecha y Hora
                      </TableHead>
                      <TableHead className="font-bold text-gray-900 dark:text-white hidden xl:table-cell">
                        Estadio
                      </TableHead>
                      <TableHead className="font-bold text-center text-gray-900 dark:text-white">
                        Resultado
                      </TableHead>
                      <TableHead className="font-bold text-gray-900 dark:text-white">
                        Estado
                      </TableHead>
                      <TableHead className="text-right font-bold text-gray-900 dark:text-white">
                        Acciones
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMatches.map((match) => (
                      <TableRow
                        key={match.id}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-colors duration-200"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white dark:border-gray-700 shadow-md flex-shrink-0">
                              <img
                                src={
                                  match.homeTeam.team.logoUrl ||
                                  "/placeholder.svg"
                                }
                                alt={`Logo ${match.homeTeam.team.name}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="font-semibold text-gray-900 dark:text-white text-sm">
                              {match.homeTeam.team.shortName} vs{" "}
                              {match.awayTeam.team.shortName}
                            </span>
                            <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white dark:border-gray-700 shadow-md flex-shrink-0">
                              <img
                                src={
                                  match.awayTeam.team.logoUrl ||
                                  "/placeholder.svg"
                                }
                                alt={`Logo ${match.awayTeam.team.name}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge className="bg-gradient-to-r from-[#ad45ff]/10 to-[#c77dff]/10 text-[#ad45ff] dark:text-[#c77dff] border-0">
                            {match.tournament.name}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Calendar className="h-4 w-4 text-[#ad45ff]" />
                            <span>
                              {formatDateOk(match.dateTime, "dd MMM")}
                            </span>
                            <Clock className="h-4 w-4 text-[#c77dff]" />
                            <span>{formatDateOk(match.dateTime, "HH:mm")}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden xl:table-cell">
                          <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                            <MapPin className="mr-1 h-4 w-4 text-[#a3b3ff]" />
                            {match.stadium}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {match.status === "FINALIZADO" ? (
                            <span className="inline-flex items-center justify-center px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg font-bold text-lg text-gray-900 dark:text-white">
                              {match.homeScore ?? 0} - {match.awayScore ?? 0}
                            </span>
                          ) : match.status === "EN_JUEGO" ? (
                            <span className="inline-flex items-center justify-center px-3 py-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg font-bold text-lg text-green-700 dark:text-green-400 animate-pulse">
                              {match.homeScore ?? 0} - {match.awayScore ?? 0}
                            </span>
                          ) : (
                            <span className="text-gray-400">vs</span>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(match.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            {(match.status === MatchStatus.EN_JUEGO ||
                              match.status === MatchStatus.FINALIZADO ||
                              match.status === MatchStatus.ENTRETIEMPO) && (
                              <DialogMatchDetails
                                match={match}
                                onUpdate={fetchMatches}
                              />
                            )}
                            <DialogAddEditMatch
                              mode="edit"
                              tournamentData={tournamentData}
                              matchData={match}
                              onSuccess={fetchMatches}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredMatches.length === 0 && matches.length > 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12">
                          <div className="space-y-3">
                            <Search className="w-10 h-10 text-gray-400 mx-auto" />
                            <p className="text-gray-500 dark:text-gray-400">
                              No se encontraron partidos con &ldquo;{searchTerm}
                              &rdquo;
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Estado vacío mejorado */}
      {matches.length === 0 && (
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#ad45ff] via-[#c77dff] to-[#a3b3ff] rounded-3xl blur opacity-20" />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl p-12 text-center border-0 shadow-2xl">
            <div className="w-20 h-20 bg-gradient-to-br from-[#ad45ff]/10 to-[#c77dff]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-[#ad45ff]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No hay partidos programados
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Comienza creando tu primer partido. Podrás programar encuentros,
              registrar resultados y gestionar el fixture completo.
            </p>
            <button className="bg-gradient-to-r from-[#ad45ff] to-[#c77dff] hover:from-[#9c3ee6] hover:to-[#b66de6] text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 inline-flex items-center gap-2 shadow-lg shadow-[#ad45ff]/25 hover:shadow-xl hover:shadow-[#ad45ff]/30 hover:scale-105">
              <Plus className="w-5 h-5" />
              Programar primer partido
            </button>
          </div>
        </div>
      )}
    </TabsContent>
  );
};

export default TabsMatches;
