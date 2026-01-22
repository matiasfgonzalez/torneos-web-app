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

import { Trash2, Trophy, Search, Filter, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { ITeam } from "@modules/equipos/types/types";
import { cn } from "@/lib/utils";
import { ITournamentTeam } from "@modules/torneos/types/tournament-teams.types";
import { ITorneo } from "@modules/torneos/types";
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
    [associations],
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
      <TabsContent value="teams" className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-[#ad45ff] to-[#c77dff] rounded-xl shadow-lg shadow-[#ad45ff]/25">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Equipos del Torneo
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {associations.length || 0} equipos asociados
              </p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar equipo..."
                value={searchTeam}
                onChange={(e) => setSearchTeam(e.target.value)}
                className="pl-10 w-full md:w-[250px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-[#ad45ff] focus:border-[#ad45ff]"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Select
                  value={filterGroup}
                  onValueChange={(v) => setFilterGroup(v)}
                >
                  <SelectTrigger className="pl-10 w-[160px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-[#ad45ff] focus:border-[#ad45ff]">
                    <SelectValue placeholder="Grupo" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl">
                    <SelectItem
                      value="ALL"
                      className="text-gray-900 dark:text-white"
                    >
                      Todos los grupos
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

        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#ad45ff] via-[#c77dff] to-[#a3b3ff] rounded-3xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300" />
          <Card className="relative bg-white dark:bg-gray-900 border-0 shadow-2xl rounded-2xl overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-[#ad45ff] via-[#c77dff] to-[#a3b3ff]" />
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-[#ad45ff] to-[#c77dff] rounded-xl shadow-lg shadow-[#ad45ff]/25">
                  <Trophy className="w-4 h-4 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                    Lista de Equipos Asociados
                  </CardTitle>
                  <CardDescription className="text-gray-500 dark:text-gray-400">
                    Gestiona asociaciones, grupos, estado y estadísticas
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/80">
                    <TableRow className="border-b border-gray-200 dark:border-gray-700 hover:bg-transparent">
                      <TableHead className="font-bold text-gray-900 dark:text-white">
                        Equipo
                      </TableHead>
                      <TableHead className="font-bold text-gray-900 dark:text-white text-center">
                        Grupo
                      </TableHead>
                      <TableHead className="font-bold text-gray-900 dark:text-white text-center">
                        Estado
                      </TableHead>
                      <TableHead className="font-bold text-gray-900 dark:text-white text-center hidden sm:table-cell">
                        PJ
                      </TableHead>
                      <TableHead className="font-bold text-gray-900 dark:text-white text-center hidden md:table-cell">
                        G
                      </TableHead>
                      <TableHead className="font-bold text-gray-900 dark:text-white text-center hidden md:table-cell">
                        E
                      </TableHead>
                      <TableHead className="font-bold text-gray-900 dark:text-white text-center hidden md:table-cell">
                        P
                      </TableHead>
                      <TableHead className="font-bold text-gray-900 dark:text-white text-center hidden lg:table-cell">
                        GF
                      </TableHead>
                      <TableHead className="font-bold text-gray-900 dark:text-white text-center hidden lg:table-cell">
                        GC
                      </TableHead>
                      <TableHead className="font-bold text-gray-900 dark:text-white text-center">
                        DG
                      </TableHead>
                      <TableHead className="font-bold text-gray-900 dark:text-white text-center">
                        Pts
                      </TableHead>
                      <TableHead className="text-right font-bold text-gray-900 dark:text-white">
                        Acciones
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {associationsForTable.map((row) => (
                      <TableRow
                        key={row.id}
                        className="hover:bg-gray-50/80 dark:hover:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 transition-colors duration-200"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white dark:border-gray-700 shadow-md">
                              <img
                                src={row.team?.logoUrl || "/placeholder.svg"}
                                alt={`Logo ${row.team?.name || "Equipo"}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-white">
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
                                  className="w-4 h-4 rounded-full border-2 border-white dark:border-gray-700 shadow-sm"
                                  style={{
                                    backgroundColor: row.team.homeColor,
                                  }}
                                  title="Color local"
                                />
                              )}
                              {row.team?.awayColor && (
                                <span
                                  className="w-4 h-4 rounded-full border-2 border-white dark:border-gray-700 shadow-sm"
                                  style={{
                                    backgroundColor: row.team.awayColor,
                                  }}
                                  title="Color visitante"
                                />
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {row.group ? (
                            <Badge className="bg-gradient-to-r from-[#ad45ff] to-[#c77dff] text-white border-0 shadow-sm">
                              Grupo {row.group}
                            </Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {row.isEliminated ? (
                            <Badge className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-0">
                              Eliminado
                            </Badge>
                          ) : (
                            <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-0">
                              En juego
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center font-medium text-gray-700 dark:text-gray-300 hidden sm:table-cell">
                          {row.matchesPlayed}
                        </TableCell>
                        <TableCell className="text-center font-semibold text-green-600 dark:text-green-400 hidden md:table-cell">
                          {row.wins}
                        </TableCell>
                        <TableCell className="text-center font-medium text-gray-500 dark:text-gray-400 hidden md:table-cell">
                          {row.draws}
                        </TableCell>
                        <TableCell className="text-center font-semibold text-red-600 dark:text-red-400 hidden md:table-cell">
                          {row.losses}
                        </TableCell>
                        <TableCell className="text-center font-medium text-gray-700 dark:text-gray-300 hidden lg:table-cell">
                          {row.goalsFor}
                        </TableCell>
                        <TableCell className="text-center font-medium text-gray-700 dark:text-gray-300 hidden lg:table-cell">
                          {row.goalsAgainst}
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={cn(
                              "inline-flex items-center justify-center w-8 h-6 rounded-md text-sm font-semibold",
                              row.goalDifference < 0
                                ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                                : row.goalDifference > 0
                                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400",
                            )}
                          >
                            {row.goalDifference > 0 ? "+" : ""}
                            {row.goalDifference}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center justify-center w-10 h-8 bg-gradient-to-r from-[#ad45ff] to-[#c77dff] text-white font-bold text-lg rounded-lg shadow-lg shadow-[#ad45ff]/25">
                            {row.points}
                          </span>
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
                                    con este torneo. Las estadísticas asociadas
                                    a esta relación se perderán.
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
                        <TableCell colSpan={12} className="text-center py-16">
                          <div className="space-y-4">
                            <div className="w-20 h-20 bg-gradient-to-br from-[#ad45ff]/10 to-[#c77dff]/10 rounded-2xl flex items-center justify-center mx-auto">
                              <Trophy className="w-10 h-10 text-[#ad45ff]" />
                            </div>
                            <div>
                              <p className="text-gray-900 dark:text-white font-semibold text-lg">
                                No hay equipos asociados
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Agrega equipos para comenzar a gestionar el
                                torneo
                              </p>
                            </div>
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
      </TabsContent>
    </>
  );
};

export default TabsTeams;
