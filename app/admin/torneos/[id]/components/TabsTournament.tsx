"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { ITorneo } from "@/components/torneos/types";
import { formatDate } from "@/lib/formatDate";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { ITeam } from "@/components/equipos/types";
import { ITournamentTeam } from "@/components/tournament-teams/types";
import TabsOverview from "./tabs-tournament/TabsOverview";
import TabsTeams from "./tabs-tournament/TabsTeams";
import TabsMatches from "./tabs-tournament/TabsMatches";

interface PropsTabsTournament {
  tournamentData: ITorneo;
  equipos: ITeam[];
  associations: ITournamentTeam[];
}

const TabsTournament = (propos: PropsTabsTournament) => {
  const { tournamentData, equipos, associations } = propos;

  const teamMap = useMemo(() => {
    const m = new Map<string, ITeam>();
    equipos.forEach((t) => m.set(t.id, t));
    return m;
  }, []);

  // Sort by points desc, then goalDifference desc, then goalsFor desc
  const standings = useMemo(() => {
    // Sort by points desc, then goalDifference desc, then goalsFor desc
    return associations.sort((a, b) => {
      if (a.points !== b.points) return b.points - a.points; // Ordenar por puntos
      if (a.wins !== b.wins) return b.wins - a.wins; // Luego por victorias
      if (a.goalDifference !== b.goalDifference)
        return b.goalDifference - a.goalDifference;
      return 0; // Si todo es igual, mantener el orden
    });
  }, [associations, teamMap]);

  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="overview" className="cursor-pointer">
          Resumen
        </TabsTrigger>
        <TabsTrigger value="teams" className="cursor-pointer">
          Equipos
        </TabsTrigger>
        <TabsTrigger value="matches" className="cursor-pointer">
          Partidos
        </TabsTrigger>
        <TabsTrigger value="stats" className="cursor-pointer">
          Estadísticas
        </TabsTrigger>
        <TabsTrigger value="settings" className="cursor-pointer">
          Configuración
        </TabsTrigger>
      </TabsList>

      {/* Overview */}
      <TabsOverview tournamentData={tournamentData} />

      {/* Teams: Association Management */}
      <TabsTeams
        tournamentData={tournamentData}
        equipos={equipos}
        associations={associations}
        teamMap={teamMap}
      />

      {/* Matches (placeholder management section, unchanged logic) */}
      <TabsMatches tournamentData={tournamentData} />

      {/* Stats: uses current associations to render tabla de posiciones */}
      <TabsContent value="stats" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Tabla de Posiciones</CardTitle>
            <CardDescription>
              Ordenada por puntos, diferencia de gol y goles a favor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pos</TableHead>
                    <TableHead>Equipo</TableHead>
                    <TableHead>PJ</TableHead>
                    <TableHead>G</TableHead>
                    <TableHead>E</TableHead>
                    <TableHead>P</TableHead>
                    <TableHead>GF</TableHead>
                    <TableHead>GC</TableHead>
                    <TableHead>DG</TableHead>
                    <TableHead>Pts</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {standings.map((row, idx) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-bold">{idx + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <img
                            src={
                              row.team?.logoUrl ||
                              "/placeholder.svg?height=24&width=24&query=team"
                            }
                            alt={`Logo ${row.team?.name || "Equipo"}`}
                            className="w-6 h-6 rounded-full object-cover border"
                          />
                          <span className="font-medium">
                            {row.team?.shortName || row.team?.name || "Equipo"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{row.matchesPlayed}</TableCell>
                      <TableCell>{row.wins}</TableCell>
                      <TableCell>{row.draws}</TableCell>
                      <TableCell>{row.losses}</TableCell>
                      <TableCell>{row.goalsFor}</TableCell>
                      <TableCell>{row.goalsAgainst}</TableCell>
                      <TableCell
                        className={cn(
                          "font-medium",
                          row.goalDifference < 0 && "text-red-600"
                        )}
                      >
                        {row.goalDifference}
                      </TableCell>
                      <TableCell className="font-bold">{row.points}</TableCell>
                    </TableRow>
                  ))}
                  {standings.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={10}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No hay equipos asociados aún.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Settings */}
      <TabsContent value="settings" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Configuración del Torneo</CardTitle>
            <CardDescription>
              Ajustes avanzados y configuraciones del torneo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium mb-2">Información Básica</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>ID del Torneo:</span>
                    <span className="font-mono">{tournamentData.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Formato:</span>
                    <span>{tournamentData.format}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ida y Vuelta:</span>
                    <span>{tournamentData.homeAndAway ? "Sí" : "No"}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Fechas</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Creado:</span>
                    <span>{formatDate(tournamentData.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Última actualización:</span>
                    <span>{formatDate(tournamentData.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h4 className="font-medium mb-4 text-red-600">Zona de Peligro</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
                  <div>
                    <h5 className="font-medium">
                      Reiniciar Estadísticas de Equipos
                    </h5>
                    <p className="text-sm text-muted-foreground">
                      Establece las estadísticas de todos los equipos del torneo
                      a 0.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
                    onClick={() => {}}
                  >
                    Reiniciar
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
                  <div>
                    <h5 className="font-medium">Eliminar Torneo</h5>
                    <p className="text-sm text-muted-foreground">
                      Elimina permanentemente el torneo y todos sus datos.
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">Eliminar</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          ¿Estás absolutamente seguro?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción no se puede deshacer. Se eliminará
                          permanentemente el torneo
                          <strong>{tournamentData.name}</strong> y todos sus
                          datos asociados.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                          Sí, eliminar torneo
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default TabsTournament;
