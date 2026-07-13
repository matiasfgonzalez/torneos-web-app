"use client";
import Link from "next/link";
import { ITorneo } from "@modules/torneos/types";
import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Target, Filter, Zap } from "lucide-react";
import { useEffect, useState, useCallback, useTransition } from "react";
import DialogAddEditMatch from "../DialogAddEditMatch";
import DialogMatchDetails from "../DialogMatchDetails";
import { IPartidos, MatchStatus, MATCH_STATUS } from "@modules/partidos/types";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { formatDate } from "@/lib/formatDate";

interface TabsTournamentProps {
  tournamentData: ITorneo;
}

const TabsMatches = (props: TabsTournamentProps) => {
  const { tournamentData } = props;
  const [matches, setMatches] = useState<IPartidos[]>([]);
  const [, startFetch] = useTransition();

  // El fetch va dentro de una transición: así el setState no queda en el cuerpo
  // del effect (react-hooks/set-state-in-effect).
  const fetchMatches = useCallback(() => {
    startFetch(async () => {
      try {
        const response = await fetch(
          `/api/matches/tournament/${tournamentData.id}`,
        );
        const data: IPartidos[] = await response.json();
        setMatches(data);
      } catch (error) {
        console.error("Error fetching matches:", error);
      }
    });
  }, [tournamentData.id]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const renderScore = (match: IPartidos) => {
    if (match.status === MatchStatus.FINALIZADO) {
      return (
        <span className="inline-flex items-center justify-center px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg font-bold text-lg text-gray-900 dark:text-white">
          {match.homeScore ?? 0} - {match.awayScore ?? 0}
        </span>
      );
    }
    if (match.status === MatchStatus.EN_JUEGO) {
      return (
        <span className="inline-flex items-center justify-center px-3 py-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg font-bold text-lg text-green-700 dark:text-green-400 animate-pulse">
          {match.homeScore ?? 0} - {match.awayScore ?? 0}
        </span>
      );
    }
    return <span className="text-gray-400">vs</span>;
  };

  // Función de render, no componente: un componente declarado dentro del render
  // se remontaría en cada render (react-hooks/static-components).
  const renderRowActions = (match: IPartidos) => (
    <>
      <Button
        asChild
        size="sm"
        className="gap-1.5 bg-gradient-to-r from-brand to-brand-mid hover:from-brand-hover hover:to-brand-mid-hover text-white shadow-md shadow-brand/20"
      >
        <Link href={`/admin/partidos/${match.id}/cargar`}>
          <Zap className="h-3.5 w-3.5" />
          Cargar
        </Link>
      </Button>
      {(match.status === MatchStatus.EN_JUEGO ||
        match.status === MatchStatus.FINALIZADO ||
        match.status === MatchStatus.ENTRETIEMPO) && (
        <DialogMatchDetails match={match} onUpdate={fetchMatches} />
      )}
      <DialogAddEditMatch
        mode="edit"
        tournamentData={tournamentData}
        matchData={match}
        onSuccess={fetchMatches}
      />
    </>
  );

  const columns: DataTableColumn<IPartidos>[] = [
    {
      id: "match",
      header: "Partido",
      sortValue: (m) => m.homeTeam.team.name,
      cell: (match) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white dark:border-gray-700 shadow-md shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={match.homeTeam.team.logoUrl || "/placeholder.svg"}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-semibold text-gray-900 dark:text-white text-sm">
            {match.homeTeam.team.shortName} vs {match.awayTeam.team.shortName}
          </span>
          <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white dark:border-gray-700 shadow-md shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={match.awayTeam.team.logoUrl || "/placeholder.svg"}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      ),
    },
    {
      id: "datetime",
      header: "Fecha y Hora",
      hideBelow: "lg",
      cardLabel: "Fecha",
      sortValue: (m) => new Date(m.dateTime).getTime(),
      cell: (match) => (
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Calendar className="h-4 w-4 text-brand shrink-0" />
          <span>{formatDate(match.dateTime, "dd MMM yyyy")}</span>
          <Clock className="h-4 w-4 text-brand-mid shrink-0" />
          <span>{formatDate(match.dateTime, "HH:mm")}</span>
        </div>
      ),
    },
    {
      id: "stadium",
      header: "Estadio",
      hideBelow: "xl",
      sortValue: (m) => m.stadium ?? "",
      cell: (match) => (
        <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
          <MapPin className="mr-1 h-4 w-4 text-brand-2 shrink-0" />
          {match.stadium || "—"}
        </div>
      ),
    },
    {
      id: "score",
      header: "Resultado",
      align: "center",
      cell: renderScore,
    },
    {
      id: "status",
      header: "Estado",
      sortValue: (m) => m.status,
      cell: (match) => <StatusBadge entity="match" status={match.status} />,
    },
    {
      id: "actions",
      header: "Acciones",
      align: "right",
      hideOnCard: true,
      cell: (match) => (
        <div className="flex justify-end items-center gap-2">
          {renderRowActions(match)}
        </div>
      ),
    },
  ];

  return (
    <TabsContent value="matches" className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-brand to-brand-mid rounded-xl shadow-lg shadow-brand/25">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Gestión de Partidos
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {matches.length} partidos programados
            </p>
          </div>
        </div>
        <DialogAddEditMatch
          mode="create"
          tournamentData={tournamentData}
          onSuccess={fetchMatches}
        />
      </div>

      <DataTable
        rows={matches}
        columns={columns}
        getRowKey={(m) => m.id}
        icon={Calendar}
        title="Lista de Partidos"
        description="Gestiona todos los partidos programados y finalizados"
        searchable={{
          placeholder: "Buscar por equipo...",
          getText: (m) =>
            `${m.homeTeam.team.name} ${m.awayTeam.team.name} ${m.homeTeam.team.shortName ?? ""} ${m.awayTeam.team.shortName ?? ""} ${m.stadium ?? ""}`,
        }}
        filters={[
          {
            id: "status",
            label: "Estado",
            icon: Filter,
            defaultValue: "ALL",
            options: [
              { value: "ALL", label: "Todos" },
              ...MATCH_STATUS.map((s) => ({ value: s.value, label: s.label })),
            ],
            test: (match, value) => match.status === value,
          },
        ]}
        empty={{
          icon: Calendar,
          title: "No hay partidos programados",
          description:
            "Comenzá creando tu primer partido: vas a poder programar encuentros, registrar resultados y gestionar el fixture completo.",
          filteredTitle: "No se encontraron partidos",
          filteredDescription:
            "Ningún partido coincide con los filtros aplicados.",
          // El botón de la empty state anterior no tenía onClick: no hacía nada.
          action: (
            <DialogAddEditMatch
              mode="create"
              tournamentData={tournamentData}
              onSuccess={fetchMatches}
            />
          ),
        }}
        rowActions={renderRowActions}
      />
    </TabsContent>
  );
};

export default TabsMatches;
