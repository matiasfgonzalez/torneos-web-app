"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

import {
  Edit,
  Trash2,
  Trophy,
  Plus,
  Eye,
  UserPlus,
  CalendarPlus,
  Search,
  Filter,
  Settings2,
} from "lucide-react";
import { ITorneo } from "@/components/torneos/types";
import { formatDate } from "@/lib/formatDate";
import { useMemo, useState } from "react";
import TournamentTeamForm from "./tournament-team-form";
import { cn } from "@/lib/utils";
import { ITeam } from "@/components/equipos/types";
import { toast } from "sonner";
import { ITournamentTeam } from "@/components/tournament-teams/types";
import TabsOverview from "./tabs-tournament/TabsOverview";

interface PropsTabsTournament {
  tournamentData: ITorneo;
  equipos: ITeam[];
  associations: ITournamentTeam[];
}

const TabsTournament = (propos: PropsTabsTournament) => {
  const { tournamentData, equipos, associations } = propos;

  const [searchTeam, setSearchTeam] = useState("");
  const [filterGroup, setFilterGroup] = useState<string | "ALL">("ALL");
  const [createAssocOpen, setCreateAssocOpen] = useState(false);
  const [editAssoc, setEditAssoc] = useState<any | null>(null);
  const [deleteAssoc, setDeleteAssoc] = useState<any | null>(null);

  // Derived helpers
  const usedTeamIds = useMemo(
    () => associations.map((a) => a.teamId),
    [associations]
  );

  const teamMap = useMemo(() => {
    const m = new Map<string, ITeam>();
    equipos.forEach((t) => m.set(t.id, t));
    return m;
  }, []);

  const groupsList = useMemo(() => {
    const set = new Set<string>();
    associations.forEach((a) => {
      if (a.group) set.add(a.group);
    });
    return Array.from(set).sort();
  }, [associations]);

  const associationsForTable = useMemo(() => {
    const term = searchTeam.toLowerCase().trim();
    return associations.filter((a) => {
      const t = teamMap.get(a.teamId);
      const inGroup =
        filterGroup === "ALL" ? true : (a.group || "") === filterGroup;
      const inSearch = !term
        ? true
        : (t?.name || "").toLowerCase().includes(term) ||
          (t?.shortName || "").toLowerCase().includes(term);
      return inGroup && inSearch;
    });
  }, [associations, teamMap, filterGroup, searchTeam]);

  // Sort by points desc, then goalDifference desc, then goalsFor desc
  const standings = useMemo(() => {
    // Sort by points desc, then goalDifference desc, then goalsFor desc
    return [...associations]
      .map((a) => ({ ...a, team: teamMap.get(a.teamId) }))
      .sort((x, y) => {
        if (y.points !== x.points) return y.points - x.points;
        if (y.goalDifference !== x.goalDifference)
          return y.goalDifference - x.goalDifference;
        return y.goalsFor - x.goalsFor;
      });
  }, [associations, teamMap]);

  const asociarEquipo = async (formData: any) => {
    try {
      const res = await fetch("/api/tournament-teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Error del servidor:", errorData);
        throw new Error(errorData.error || "Error al asociar equipo");
      }

      const data = await res.json();
      console.log("Asociación creada:", data);
      return data;
    } catch (error) {
      console.error(`Error al cargar la noticia: ${error}`);
      toast.error(`Error al cargar la noticia: ${error}`);
    }
  };

  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="overview">Resumen</TabsTrigger>
        <TabsTrigger value="teams">Equipos</TabsTrigger>
        <TabsTrigger value="matches">Partidos</TabsTrigger>
        <TabsTrigger value="stats">Estadísticas</TabsTrigger>
        <TabsTrigger value="settings">Configuración</TabsTrigger>
      </TabsList>

      {/* Overview */}
      <TabsOverview tournamentData={tournamentData} />

      {/* Teams: Association Management */}
      <TabsContent value="teams" className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-medium">Equipos del Torneo</h3>
            <p className="text-sm text-muted-foreground">
              {associations.length || 0} equipos asociados
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-2 md:items-center">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar equipo por nombre o alias..."
                value={searchTeam}
                onChange={(e) => setSearchTeam(e.target.value)}
                className="pl-8 w-full md:w-[280px]"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select
                value={filterGroup}
                onValueChange={(v) => setFilterGroup(v as any)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Grupo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  {groupsList.map((g) => (
                    <SelectItem key={g} value={g}>
                      Grupo {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Dialog open={createAssocOpen} onOpenChange={setCreateAssocOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Asociar equipo
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Asociar equipo al torneo</DialogTitle>
                  <DialogDescription>
                    Basado en el modelo TournamentTeam: un equipo no puede
                    repetirse en el mismo torneo.
                  </DialogDescription>
                </DialogHeader>
                <TournamentTeamForm
                  mode="create"
                  tournamentId={tournamentData.id}
                  tournamentTeam={null}
                  teams={equipos}
                  usedTeamIds={usedTeamIds}
                  onCancel={() => setCreateAssocOpen(false)}
                  onSubmit={asociarEquipo}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Equipos Asociados</CardTitle>
            <CardDescription>
              Gestiona asociaciones, grupos, estado y estadísticas
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Equipo</TableHead>
                    <TableHead>Grupo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>PJ</TableHead>
                    <TableHead>G</TableHead>
                    <TableHead>E</TableHead>
                    <TableHead>P</TableHead>
                    <TableHead>GF</TableHead>
                    <TableHead>GC</TableHead>
                    <TableHead>DG</TableHead>
                    <TableHead>Pts</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {associationsForTable.map((row) => (
                    <TableRow key={row.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              row.team?.logoUrl ||
                              "/placeholder.svg?height=32&width=32&query=team"
                            }
                            alt={`Logo ${row.team?.name || "Equipo"}`}
                            className="w-8 h-8 object-cover"
                          />
                          <div>
                            <div className="font-medium">
                              {row.team?.name || "Desconocido"}
                            </div>
                            {row.team?.shortName && (
                              <div className="text-xs text-muted-foreground">
                                {row.team.shortName}
                              </div>
                            )}
                          </div>
                          <div className="flex space-x-1">
                            {row.team?.homeColor && (
                              <span
                                className="w-3 h-3 rounded-full border"
                                style={{ backgroundColor: row.team.homeColor }}
                                title="Color local"
                              />
                            )}
                            {row.team?.awayColor && (
                              <span
                                className="w-3 h-3 rounded-full border"
                                style={{ backgroundColor: row.team.awayColor }}
                                title="Color visitante"
                              />
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {row.group || "-"}
                      </TableCell>
                      <TableCell>
                        {row.isEliminated ? (
                          <Badge variant="destructive">Eliminado</Badge>
                        ) : (
                          <Badge variant="outline">En competencia</Badge>
                        )}
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
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" title="Ver equipo">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Agregar jugador a este equipo"
                          >
                            <UserPlus className="h-4 w-4" />
                          </Button>
                          <Dialog
                            open={!!editAssoc && editAssoc.id === row.id}
                            onOpenChange={(o) => !o && setEditAssoc(null)}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Editar asociación"
                                onClick={() => setEditAssoc(row)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Editar asociación</DialogTitle>
                                <DialogDescription>
                                  Actualiza grupo, estado y estadísticas
                                </DialogDescription>
                              </DialogHeader>
                              {editAssoc && (
                                <TournamentTeamForm
                                  mode="edit"
                                  tournamentId={tournamentData.id}
                                  tournamentTeam={row}
                                  teams={[]}
                                  usedTeamIds={[]}
                                  initialValues={editAssoc}
                                  onCancel={() => setEditAssoc(null)}
                                  onSubmit={(vals) =>
                                    console.log(editAssoc.id, vals)
                                  }
                                />
                              )}
                            </DialogContent>
                          </Dialog>
                          <AlertDialog
                            open={!!deleteAssoc && deleteAssoc.id === row.id}
                            onOpenChange={(o) => !o && setDeleteAssoc(null)}
                          >
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Quitar del torneo"
                                onClick={() => setDeleteAssoc(row)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Quitar equipo del torneo
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción eliminará la relación del equipo{" "}
                                  <strong> "{row.team?.name}"</strong> con este
                                  torneo. Las estadísticas asociadas a esta
                                  relación se perderán.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-700"
                                  onClick={() => console.log(row.id)}
                                >
                                  Quitar equipo
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {associationsForTable.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={12} className="text-center py-8">
                        <Trophy className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                        <div className="text-sm text-muted-foreground">
                          No se encontraron asociaciones
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Matches (placeholder management section, unchanged logic) */}
      <TabsContent value="matches" className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">Gestión de Partidos</h3>
            <p className="text-sm text-muted-foreground">
              {tournamentData.matches} de {tournamentData.matches?.length}{" "}
              partidos jugados
            </p>
          </div>
          <Button>
            <CalendarPlus className="mr-2 h-4 w-4" />
            Programar Partido
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              Próximamente: programación y resultados
            </CardTitle>
            <CardDescription>
              Integra aquí tu lógica de calendario de partidos.
            </CardDescription>
          </CardHeader>
        </Card>
      </TabsContent>

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
                          <strong> "{tournamentData.name}"</strong> y todos sus
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
