"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Eye, Filter, MapPin, Users } from "lucide-react";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/shared/DataTable";
import { ITeam } from "@modules/equipos/types/types";
import TeamForm from "./team-form";
import DeleteTeamButton from "./DeleteTeamButton";

interface PropsTeamsTable {
  teams: ITeam[];
}

function StatusBadge({ enabled }: { enabled: boolean }) {
  return enabled ? (
    <Badge className="bg-green-50 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30">
      Activo
    </Badge>
  ) : (
    <Badge className="bg-red-50 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30">
      Deshabilitado
    </Badge>
  );
}

function RowActions({ team }: { team: ITeam }) {
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        asChild
        title="Ver perfil público"
        className="hover:bg-brand hover:text-white hover:border-brand transition-all"
      >
        <Link href={`/equipos/${team.id}`}>
          <Eye className="h-4 w-4" />
          <span className="sr-only">Ver {team.name}</span>
        </Link>
      </Button>
      <TeamForm isEditMode={true} team={team} />
      <DeleteTeamButton team={team} />
    </>
  );
}

/** Lista de equipos del panel — usa el DataTable común (F3). */
const TeamsTable = ({ teams }: PropsTeamsTable) => {
  const columns: DataTableColumn<ITeam>[] = [
    {
      id: "team",
      header: "Equipo",
      sortValue: (t) => t.name,
      cell: (team) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl border-2 border-gray-200 dark:border-gray-600 overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={team.logoUrl || "/placeholder.svg"}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg";
              }}
            />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-gray-900 dark:text-white truncate">
              {team.name}
            </div>
            {team.yearFounded && (
              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                <Calendar className="mr-1 h-3 w-3" />
                Fundado en {team.yearFounded}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      id: "city",
      header: "Ciudad",
      sortValue: (t) => t.homeCity ?? "",
      cell: (team) =>
        team.homeCity ? (
          <div className="flex items-center text-gray-700 dark:text-gray-300">
            <MapPin className="mr-1 h-4 w-4 text-gray-400" />
            {team.homeCity}
          </div>
        ) : (
          "-"
        ),
    },
    {
      id: "coach",
      header: "DT",
      sortValue: (t) => t.coach ?? "",
      cell: (team) => (
        <span className="text-gray-700 dark:text-gray-300">
          {team.coach || "-"}
        </span>
      ),
    },
    {
      id: "colors",
      header: "Colores",
      hideBelow: "xl",
      cell: (team) => (
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-lg border-2 border-white dark:border-gray-600 shadow-md"
            style={{ backgroundColor: team.homeColor }}
            title="Color local"
          />
          <div
            className="w-6 h-6 rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-md"
            style={{ backgroundColor: team.awayColor }}
            title="Color visitante"
          />
        </div>
      ),
    },
    {
      id: "players",
      header: "Jugadores",
      hideBelow: "lg",
      sortValue: (t) => t.players?.length ?? 0,
      cell: (team) => (
        <div className="flex items-center text-gray-700 dark:text-gray-300">
          <Users className="mr-1 h-4 w-4 text-gray-400" />
          {team.players?.length || 0}
        </div>
      ),
    },
    {
      id: "status",
      header: "Estado",
      sortValue: (t) => (t.enabled ? 0 : 1),
      cell: (team) => <StatusBadge enabled={team.enabled} />,
    },
    {
      id: "actions",
      header: "Acciones",
      align: "right",
      hideOnCard: true,
      cell: (team) => (
        <div className="flex justify-end gap-2">
          <RowActions team={team} />
        </div>
      ),
    },
  ];

  return (
    <DataTable
      rows={teams}
      columns={columns}
      getRowKey={(t) => t.id}
      icon={Users}
      title="Lista de Equipos"
      description="Gestiona todos los equipos registrados en la plataforma"
      searchable={{
        placeholder: "Buscar por nombre, ciudad o DT...",
        getText: (t) => `${t.name} ${t.homeCity ?? ""} ${t.coach ?? ""}`,
      }}
      filters={[
        {
          id: "status",
          label: "Estado",
          icon: Filter,
          options: [
            { value: "all", label: "Todos" },
            { value: "active", label: "Activos" },
            { value: "disabled", label: "Deshabilitados" },
          ],
          test: (team, value) =>
            value === "active" ? team.enabled : !team.enabled,
        },
      ]}
      empty={{
        icon: Users,
        title: "Todavía no hay equipos",
        description: "Comenzá registrando tu primer equipo.",
        filteredTitle: "No se encontraron equipos",
        filteredDescription:
          "Ningún equipo coincide con los filtros aplicados.",
      }}
      rowActions={(team) => <RowActions team={team} />}
    />
  );
};

export default TeamsTable;
