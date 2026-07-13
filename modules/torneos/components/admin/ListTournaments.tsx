"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Eye, Filter, MapPin, Trophy } from "lucide-react";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ITorneo } from "@modules/torneos/types";
import { formatDate } from "@/lib/formatDate";
import {
  formatTournamentCategory,
  TOURNAMENT_STATUS_OPTIONS,
} from "@/lib/constants";
import { DeleteTournamentButton } from "./DeleteTournamentButton";
import DialogAddTournaments from "./DialogAddTournaments";

interface PropsListTournaments {
  tournaments: ITorneo[];
}

function RowActions({ tournament }: { tournament: ITorneo }) {
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        asChild
        title="Abrir torneo"
        className="hover:bg-brand hover:text-white hover:border-brand transition-all"
      >
        <Link href={`/admin/torneos/${tournament.id}`}>
          <Eye className="h-4 w-4" />
          <span className="sr-only">Abrir {tournament.name}</span>
        </Link>
      </Button>
      <DialogAddTournaments tournament={tournament} />
      <DeleteTournamentButton tournament={tournament} />
    </>
  );
}

/** Lista de torneos del panel — usa el DataTable común (F3). */
const ListTournaments = ({ tournaments }: PropsListTournaments) => {
  const columns: DataTableColumn<ITorneo>[] = [
    {
      id: "tournament",
      header: "Torneo",
      sortValue: (t) => t.name,
      cell: (t) => (
        <div className="space-y-1 min-w-0">
          <div className="font-semibold text-gray-900 dark:text-white truncate">
            {t.name}
          </div>
          {t.locality && (
            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">{t.locality}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      id: "category",
      header: "Categoría",
      sortValue: (t) => formatTournamentCategory(t),
      cell: (t) => (
        <Badge variant="outline" className="font-medium">
          {formatTournamentCategory(t)}
        </Badge>
      ),
    },
    {
      id: "status",
      header: "Estado",
      sortValue: (t) => t.status,
      cell: (t) => <StatusBadge entity="tournament" status={t.status} />,
    },
    {
      id: "startDate",
      header: "Inicio",
      sortValue: (t) => new Date(t.startDate).getTime(),
      cell: (t) => (
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {formatDate(t.startDate, "dd MMM yyyy")}
        </span>
      ),
    },
    {
      id: "endDate",
      header: "Fin",
      hideBelow: "lg",
      sortValue: (t) => (t.endDate ? new Date(t.endDate).getTime() : 0),
      cell: (t) => (
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {t.endDate ? formatDate(t.endDate, "dd MMM yyyy") : "—"}
        </span>
      ),
    },
    {
      id: "nextMatch",
      header: "Próximo partido",
      hideBelow: "xl",
      cell: (t) => (
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {t.nextMatch ? formatDate(t.nextMatch, "dd MMM yyyy") : "—"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Acciones",
      align: "right",
      hideOnCard: true,
      cell: (t) => (
        <div className="flex justify-end gap-2">
          <RowActions tournament={t} />
        </div>
      ),
    },
  ];

  return (
    <DataTable
      rows={tournaments}
      columns={columns}
      getRowKey={(t) => t.id}
      icon={Trophy}
      title="Lista de Torneos"
      description="Gestiona todos los torneos registrados en la plataforma"
      searchable={{
        placeholder: "Buscar por nombre, categoría o localidad...",
        getText: (t) =>
          `${t.name} ${formatTournamentCategory(t)} ${t.locality ?? ""}`,
      }}
      filters={[
        {
          id: "status",
          label: "Estado",
          icon: Filter,
          // Valores del enum real (ACTIVO/INSCRIPCION/...). Antes se comparaba
          // contra labels de UI ("En curso", "Inscripciones"): el filtro no
          // matcheaba nunca y el badge caía siempre al caso default.
          options: [
            { value: "all", label: "Todos" },
            ...TOURNAMENT_STATUS_OPTIONS.map((o) => ({
              value: o.value as string,
              label: o.label,
            })),
          ],
          test: (t, value) => t.status === value,
        },
      ]}
      empty={{
        icon: Calendar,
        title: "Todavía no hay torneos",
        description: "Creá tu primer torneo para comenzar.",
        filteredTitle: "No se encontraron torneos",
        filteredDescription: "Ningún torneo coincide con los filtros aplicados.",
      }}
      rowActions={(t) => <RowActions tournament={t} />}
    />
  );
};

export default ListTournaments;
