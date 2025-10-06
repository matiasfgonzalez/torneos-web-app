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

import { Trash2, Trophy, Search, Filter } from "lucide-react";
import { useMemo, useState } from "react";
import { ITeam } from "@/components/equipos/types";
import { cn } from "@/lib/utils";
import { ITournamentTeam } from "@/components/tournament-teams/types";
import { ITorneo } from "@/components/torneos/types";
import DialogAddEditTeamTournament from "../DialogAddEditTeamTournament";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { FullscreenLoading } from "@/components/fullscreen-loading";
import DialogAddEditTeamPlayer from "../DialogAddEditTeamPlayer";

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
  const [deleteAssoc, setDeleteAssoc] = useState<ITournamentTeam | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

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

  const handleDelete = async (id: string) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/tournament-teams/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Error al eliminar el equipo del torneo");

      toast.success("Equipo eliminado correctamente del torneo");

      // Sólo cerrar el modal si la eliminación fue exitosa
      router.refresh();
    } catch (error) {
      toast.error("No se pudo eliminar el equipo");
      console.error(error);
    } finally {
      setIsLoading(false); // Siempre asegurarse de resetear el estado
      setDeleteAssoc(null);
    }
  };

  return (
    <>
      {isLoading && (
        <FullscreenLoading
          isVisible={isLoading}
          message="Eliminando equipo..."
        />
      )}
      <TabsContent value="teams" className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Equipos del Torneo
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {associations.length || 0} equipos asociados
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-2 md:items-center">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                placeholder="Buscar equipo por nombre o alias..."
                value={searchTeam}
                onChange={(e) => setSearchTeam(e.target.value)}
                className="pl-8 w-full md:w-[280px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Select
                value={filterGroup}
                onValueChange={(v) => setFilterGroup(v)}
              >
                <SelectTrigger className="w-[140px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                  <SelectValue placeholder="Grupo" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <SelectItem
                    value="ALL"
                    className="text-gray-900 dark:text-white"
                  >
                    Todos
                  </SelectItem>
                  {groupsList.map((g) => (
                    <SelectItem
                      key={g}
                      value={g}
                      className="text-gray-900 dark:text-white"
                    >
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

        <Card className="border-2 border-[#ad45ff]/20 dark:border-[#8b39cc]/30 shadow-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">
              Lista de Equipos Asociados
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              Gestiona asociaciones, grupos, estado y estadísticas
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b dark:border-gray-700">
                    <TableHead className="text-gray-900 dark:text-white">
                      Equipo
                    </TableHead>
                    <TableHead className="text-gray-900 dark:text-white">
                      Grupo
                    </TableHead>
                    <TableHead className="text-gray-900 dark:text-white">
                      Estado
                    </TableHead>
                    <TableHead className="text-gray-900 dark:text-white">
                      PJ
                    </TableHead>
                    <TableHead className="text-gray-900 dark:text-white">
                      G
                    </TableHead>
                    <TableHead className="text-gray-900 dark:text-white">
                      E
                    </TableHead>
                    <TableHead className="text-gray-900 dark:text-white">
                      P
                    </TableHead>
                    <TableHead className="text-gray-900 dark:text-white">
                      GF
                    </TableHead>
                    <TableHead className="text-gray-900 dark:text-white">
                      GC
                    </TableHead>
                    <TableHead className="text-gray-900 dark:text-white">
                      DG
                    </TableHead>
                    <TableHead className="text-gray-900 dark:text-white">
                      Pts
                    </TableHead>
                    <TableHead className="text-right text-gray-900 dark:text-white">
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {associationsForTable.map((row) => (
                    <TableRow
                      key={row.id}
                      className="hover:bg-gray-50/80 dark:hover:bg-gray-700/50 border-b dark:border-gray-700"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              row.team?.logoUrl ||
                              "/placeholder.svg?height=32&width=32&query=team"
                            }
                            alt={`Logo ${row.team?.name || "Equipo"}`}
                            className="w-8 h-8 object-cover rounded"
                          />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {row.team?.name || "Desconocido"}
                            </div>
                            {row.team?.shortName && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {row.team.shortName}
                              </div>
                            )}
                          </div>
                          <div className="flex space-x-1">
                            {row.team?.homeColor && (
                              <span
                                className="w-3 h-3 rounded-full border border-gray-300 dark:border-gray-600"
                                style={{ backgroundColor: row.team.homeColor }}
                                title="Color local"
                              />
                            )}
                            {row.team?.awayColor && (
                              <span
                                className="w-3 h-3 rounded-full border border-gray-300 dark:border-gray-600"
                                style={{ backgroundColor: row.team.awayColor }}
                                title="Color visitante"
                              />
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-gray-900 dark:text-white">
                        {row.group || "-"}
                      </TableCell>
                      <TableCell>
                        {row.isEliminated ? (
                          <Badge
                            variant="destructive"
                            className="bg-red-600 text-white"
                          >
                            Eliminado
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="border-green-500 text-green-600 dark:border-green-400 dark:text-green-400"
                          >
                            En competencia
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-gray-900 dark:text-white">
                        {row.matchesPlayed}
                      </TableCell>
                      <TableCell className="text-gray-900 dark:text-white">
                        {row.wins}
                      </TableCell>
                      <TableCell className="text-gray-900 dark:text-white">
                        {row.draws}
                      </TableCell>
                      <TableCell className="text-gray-900 dark:text-white">
                        {row.losses}
                      </TableCell>
                      <TableCell className="text-gray-900 dark:text-white">
                        {row.goalsFor}
                      </TableCell>
                      <TableCell className="text-gray-900 dark:text-white">
                        {row.goalsAgainst}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "font-medium",
                          row.goalDifference < 0
                            ? "text-red-600 dark:text-red-400"
                            : "text-gray-900 dark:text-white"
                        )}
                      >
                        {row.goalDifference}
                      </TableCell>
                      <TableCell className="font-bold text-gray-900 dark:text-white">
                        {row.points}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <DialogAddEditTeamPlayer
                            mode="create"
                            tournamentData={tournamentData}
                            teamData={row}
                          />
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
                                className="cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 text-red-600 dark:text-red-400"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-gray-900 dark:text-white">
                                  Quitar equipo del torneo
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
                                  Esta acción eliminará la relación del equipo{" "}
                                  <strong className="text-gray-900 dark:text-white">
                                    {" "}
                                    {row.team?.name}
                                  </strong>{" "}
                                  con este torneo. Las estadísticas asociadas a
                                  esta relación se perderán.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600">
                                  Cancelar
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
                                  onClick={() => handleDelete(row.id)}
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
                        <Trophy className="mx-auto h-10 w-10 text-gray-400 dark:text-gray-500 mb-2" />
                        <div className="text-sm text-gray-500 dark:text-gray-400">
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
    </>
  );
};

export default TabsTeams;
