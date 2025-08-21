"use client";
import { TabsContent } from "@/components/ui/tabs";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
  Search,
  Filter,
} from "lucide-react";
import { useMemo, useState } from "react";
import TournamentTeamForm from "../tournament-team-form";
import { toast } from "sonner";
import { ITeam } from "@/components/equipos/types";
import { cn } from "@/lib/utils";
import { ITournamentTeam } from "@/components/tournament-teams/types";
import { ITorneo } from "@/components/torneos/types";
import DialogAddEditTeamTournament from "../DialogAddEditTeamTournament";

interface TabsTeamsProps {
  tournamentData: ITorneo;
  equipos: ITeam[];
  associations: ITournamentTeam[];
  teamMap: Map<string, ITeam>;
}

const TabsTeams = (props: TabsTeamsProps) => {
  const { tournamentData, equipos, associations, teamMap } = props;

  const [searchTeam, setSearchTeam] = useState("");
  const [filterGroup, setFilterGroup] = useState<string | "ALL">("ALL");
  const [createAssocOpen, setCreateAssocOpen] = useState(false);
  const [editAssoc, setEditAssoc] = useState<any | null>(null);
  const [deleteAssoc, setDeleteAssoc] = useState<any | null>(null);

  const groupsList = useMemo(() => {
    const set = new Set<string>();
    associations.forEach((a) => {
      if (a.group) set.add(a.group);
    });
    return Array.from(set).sort();
  }, [associations]);

  const usedTeamIds = useMemo(
    () => associations.map((a) => a.teamId),
    [associations]
  );

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
          <DialogAddEditTeamTournament
            mode="create"
            tournamentData={tournamentData}
            equipos={equipos}
            usedTeamIds={usedTeamIds}
            tournamentTeam={null}
          />
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
                        <DialogAddEditTeamTournament
                          mode="edit"
                          tournamentData={tournamentData}
                          equipos={equipos}
                          usedTeamIds={usedTeamIds}
                          tournamentTeam={row}
                        />
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
  );
};

export default TabsTeams;
