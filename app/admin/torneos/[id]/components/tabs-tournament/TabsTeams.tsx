"use client";
import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
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
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";

import { Trash2, Trophy, Filter, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { ITeam } from "@modules/equipos/types/types";
import { cn } from "@/lib/utils";
import { ITournamentTeam } from "@modules/torneos/types/tournament-teams.types";
import { ITorneo } from "@modules/torneos/types";
import TournamentTeamSheet from "../TournamentTeamSheet";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { FullscreenLoading } from "@/components/fullscreen-loading";
import TeamRosterSheet from "../TeamRosterSheet";

interface TabsTeamsProps {
  tournamentData: ITorneo;
  equipos: ITeam[];
  associations: ITournamentTeam[];
  teamMap: Map<string, ITeam>;
}

const diffClass = (d: number) =>
  d < 0
    ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
    : d > 0
      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400";

/** Chip numérico compacto usado en la card de mobile. */
function StatChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center rounded-lg bg-gray-50 dark:bg-gray-800 px-2 py-1.5">
      <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
      <span className="text-sm font-semibold text-gray-900 dark:text-white">
        {value}
      </span>
    </div>
  );
}

const TabsTeams = (props: TabsTeamsProps) => {
  const { tournamentData, equipos, associations, teamMap } = props;

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

  const handleDelete = async (id: string) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/tournament-teams/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Error al eliminar el equipo del torneo");

      toast.success("Equipo eliminado correctamente del torneo");
      router.refresh();
    } catch (error) {
      toast.error("No se pudo eliminar el equipo");
      console.error(error);
    } finally {
      setIsLoading(false);
      setDeleteAssoc(null);
    }
  };

  // Función de render (no componente): declarar un componente dentro del render
  // lo remontaría en cada render — react-hooks/static-components.
  const renderRowActions = (row: ITournamentTeam) => (
    <>
      <TeamRosterSheet teamData={row} />
      <TournamentTeamSheet
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
            <span className="sr-only">Quitar {row.team?.name} del torneo</span>
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
                {row.team?.name}
              </strong>{" "}
              con este torneo. Las estadísticas asociadas a esta relación se
              perderán.
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
    </>
  );

  const teamName = (row: ITournamentTeam) =>
    row.team?.name ?? teamMap.get(row.teamId)?.name ?? "Desconocido";

  const numericCol = (
    id: string,
    header: string,
    get: (row: ITournamentTeam) => number,
    opts: { hideBelow?: "lg" | "xl"; className?: string } = {},
  ): DataTableColumn<ITournamentTeam> => ({
    id,
    header,
    align: "center",
    hideBelow: opts.hideBelow,
    hideOnCard: true, // los números van en los chips de la card
    sortValue: get,
    cell: (row) => (
      <span
        className={cn(
          "font-medium text-gray-700 dark:text-gray-300",
          opts.className,
        )}
      >
        {get(row)}
      </span>
    ),
  });

  const columns: DataTableColumn<ITournamentTeam>[] = [
    {
      id: "team",
      header: "Equipo",
      sortValue: teamName,
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white dark:border-gray-700 shadow-md shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={row.team?.logoUrl || "/placeholder.svg"}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-gray-900 dark:text-white truncate">
              {teamName(row)}
            </div>
            {row.team?.shortName && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {row.team.shortName}
              </div>
            )}
          </div>
          <div className="flex space-x-1 shrink-0">
            {row.team?.homeColor && (
              <span
                className="w-4 h-4 rounded-full border-2 border-white dark:border-gray-700 shadow-sm"
                style={{ backgroundColor: row.team.homeColor }}
                title="Color local"
              />
            )}
            {row.team?.awayColor && (
              <span
                className="w-4 h-4 rounded-full border-2 border-white dark:border-gray-700 shadow-sm"
                style={{ backgroundColor: row.team.awayColor }}
                title="Color visitante"
              />
            )}
          </div>
        </div>
      ),
    },
    {
      id: "group",
      header: "Grupo",
      align: "center",
      sortValue: (row) => row.group ?? "",
      cell: (row) =>
        row.group ? (
          <Badge className="bg-gradient-to-r from-brand to-brand-mid text-white border-0 shadow-sm">
            Grupo {row.group}
          </Badge>
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
    {
      id: "status",
      header: "Estado",
      align: "center",
      sortValue: (row) => (row.isEliminated ? 1 : 0),
      cell: (row) =>
        row.isEliminated ? (
          <Badge className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-0">
            Eliminado
          </Badge>
        ) : (
          <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-0">
            En juego
          </Badge>
        ),
    },
    numericCol("matchesPlayed", "PJ", (r) => r.matchesPlayed),
    numericCol("wins", "G", (r) => r.wins, {
      hideBelow: "lg",
      className: "font-semibold text-green-600 dark:text-green-400",
    }),
    numericCol("draws", "E", (r) => r.draws, { hideBelow: "lg" }),
    numericCol("losses", "P", (r) => r.losses, {
      hideBelow: "lg",
      className: "font-semibold text-red-600 dark:text-red-400",
    }),
    numericCol("goalsFor", "GF", (r) => r.goalsFor, { hideBelow: "xl" }),
    numericCol("goalsAgainst", "GC", (r) => r.goalsAgainst, {
      hideBelow: "xl",
    }),
    {
      id: "goalDifference",
      header: "DG",
      align: "center",
      hideOnCard: true,
      sortValue: (row) => row.goalDifference,
      cell: (row) => (
        <span
          className={cn(
            "inline-flex items-center justify-center w-8 h-6 rounded-md text-sm font-semibold",
            diffClass(row.goalDifference),
          )}
        >
          {row.goalDifference > 0 ? "+" : ""}
          {row.goalDifference}
        </span>
      ),
    },
    {
      id: "points",
      header: "Pts",
      align: "center",
      hideOnCard: true,
      sortValue: (row) => row.points,
      cell: (row) => (
        <span className="inline-flex items-center justify-center w-10 h-8 bg-gradient-to-r from-brand to-brand-mid text-white font-bold text-lg rounded-lg shadow-lg shadow-brand/25">
          {row.points}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Acciones",
      align: "right",
      hideOnCard: true,
      cell: (row) => (
        <div className="flex justify-end gap-2">{renderRowActions(row)}</div>
      ),
    },
  ];

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
            <div className="p-2.5 bg-gradient-to-br from-brand to-brand-mid rounded-xl shadow-lg shadow-brand/25">
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
          <TournamentTeamSheet
            mode="create"
            tournamentData={tournamentData}
            equipos={equipos}
            usedTeamIds={usedTeamIds}
            tournamentTeam={null}
          />
        </div>

        <DataTable
          rows={associations}
          columns={columns}
          getRowKey={(row) => row.id}
          icon={Trophy}
          title="Lista de Equipos Asociados"
          description="Gestiona asociaciones, grupos, estado y estadísticas"
          searchable={{
            placeholder: "Buscar equipo...",
            getText: (row) => `${teamName(row)} ${row.team?.shortName ?? ""}`,
          }}
          filters={
            groupsList.length > 0
              ? [
                  {
                    id: "group",
                    label: "Grupo",
                    icon: Filter,
                    options: [
                      { value: "ALL", label: "Todos" },
                      ...groupsList.map((g) => ({
                        value: g,
                        label: `Grupo ${g}`,
                      })),
                    ],
                    defaultValue: "ALL",
                    test: (row, value) => (row.group || "") === value,
                  },
                ]
              : undefined
          }
          empty={{
            icon: Trophy,
            title: "No hay equipos asociados",
            description: "Agregá equipos para comenzar a gestionar el torneo.",
            filteredTitle: "No se encontraron equipos",
            filteredDescription:
              "Ningún equipo coincide con los filtros aplicados.",
          }}
          renderCard={(row) => (
            <div className="rounded-xl border-2 border-gray-100 dark:border-gray-700 p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white dark:border-gray-700 shadow-md shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={row.team?.logoUrl || "/placeholder.svg"}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-gray-900 dark:text-white truncate">
                    {teamName(row)}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    {row.group && (
                      <Badge className="bg-gradient-to-r from-brand to-brand-mid text-white border-0">
                        Grupo {row.group}
                      </Badge>
                    )}
                    {row.isEliminated ? (
                      <Badge className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-0">
                        Eliminado
                      </Badge>
                    ) : (
                      <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-0">
                        En juego
                      </Badge>
                    )}
                  </div>
                </div>
                <span className="inline-flex flex-col items-center justify-center min-w-12 px-2 py-1 bg-gradient-to-r from-brand to-brand-mid text-white rounded-lg shadow-lg shadow-brand/25">
                  <span className="text-lg font-bold leading-none">
                    {row.points}
                  </span>
                  <span className="text-[10px] uppercase tracking-wide">
                    pts
                  </span>
                </span>
              </div>

              <div className="grid grid-cols-6 gap-1.5">
                <StatChip label="PJ" value={row.matchesPlayed} />
                <StatChip label="G" value={row.wins} />
                <StatChip label="E" value={row.draws} />
                <StatChip label="P" value={row.losses} />
                <StatChip label="GF" value={row.goalsFor} />
                <StatChip label="GC" value={row.goalsAgainst} />
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <span
                  className={cn(
                    "inline-flex items-center justify-center px-2 h-6 rounded-md text-sm font-semibold",
                    diffClass(row.goalDifference),
                  )}
                >
                  DG {row.goalDifference > 0 ? "+" : ""}
                  {row.goalDifference}
                </span>
                <div className="flex gap-2">{renderRowActions(row)}</div>
              </div>
            </div>
          )}
        />
      </TabsContent>
    </>
  );
};

export default TabsTeams;
