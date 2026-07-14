"use client";

import { Badge } from "@/components/ui/badge";
import { Activity, MapPinHouse, Users } from "lucide-react";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { IPlayer } from "@modules/jugadores/types";
import {
  PLAYER_STATUS_OPTIONS,
  PLAYER_POSITION_LABELS,
  FOOT_LABELS,
} from "@/lib/constants";
import { calcularEdad } from "@/lib/calcularEdad";
import type { Foot, PlayerPosition } from "@prisma/client";
import PlayerForm from "./player-form";
import { DeleteOrDisableButtons } from "@/components/shared/DeleteOrDisableButtons";
import { deletePlayer, togglePlayerEnabled } from "@modules/jugadores/actions/players";

interface PropsPlayersTable {
  players: IPlayer[];
}

/**
 * Acciones de fila. La baja la resuelve `DeleteOrDisableButtons`: eliminar solo
 * si el jugador nunca jugó en un equipo (`_count.teamPlayer === 0`), y si no,
 * deshabilitarlo para no perder goles/tarjetas/sanciones (ver
 * `modules/jugadores/actions/players.ts`).
 */
function RowActions({ player }: Readonly<{ player: IPlayer }>) {
  return (
    <>
      <PlayerForm isEditMode={true} player={player} />
      <DeleteOrDisableButtons
        entityLabel="jugador"
        name={player.name}
        enabled={player.enabled}
        relationCount={player._count?.teamPlayer ?? 0}
        relationLabel="equipos"
        disableConsequence="no vas a poder sumarlo a ningún equipo"
        onDelete={() => deletePlayer(player.id)}
        onToggleEnabled={() => togglePlayerEnabled(player.id)}
      />
    </>
  );
}

const positionLabel = (p: string | null) =>
  p ? (PLAYER_POSITION_LABELS[p as PlayerPosition] ?? p) : "Sin posición";

const footLabel = (f: string | null) =>
  f ? (FOOT_LABELS[f as Foot] ?? f) : "—";

/** Lista de jugadores del panel — usa el DataTable común (F3). */
const PlayersTable = ({ players }: PropsPlayersTable) => {
  const columns: DataTableColumn<IPlayer>[] = [
    {
      id: "player",
      header: "Jugador",
      sortValue: (p) => p.name,
      cell: (player) => (
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-600">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={player.imageUrlFace || "/placeholder.svg"}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg";
                }}
              />
            </div>
            {player.number != null && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-r from-brand to-brand-2 text-white flex items-center justify-center text-xs font-bold shadow-lg">
                {player.number}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-gray-900 dark:text-white truncate">
              {player.name}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {player.nationality}
              {player.birthDate && ` · ${calcularEdad(player.birthDate)} años`}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "position",
      header: "Posición",
      sortValue: (p) => positionLabel(p.position),
      cell: (player) => (
        <div className="space-y-1">
          <Badge
            variant="outline"
            className="border-brand/30 text-brand font-medium"
          >
            {positionLabel(player.position)}
          </Badge>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Pie: {footLabel(player.dominantFoot)}
          </div>
        </div>
      ),
    },
    {
      id: "physical",
      header: "Físico",
      hideBelow: "lg",
      cardLabel: "Físico",
      cell: (player) => (
        <div className="text-sm text-gray-700 dark:text-gray-300">
          {player.height ? `${player.height} cm` : "—"}
          {" · "}
          {player.weight ? `${player.weight} kg` : "—"}
        </div>
      ),
    },
    {
      id: "birthPlace",
      header: "Lugar de nacimiento",
      hideBelow: "xl",
      cardLabel: "Nacido en",
      sortValue: (p) => p.birthPlace ?? "",
      cell: (player) => (
        <div className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
          <MapPinHouse className="h-4 w-4 text-gray-400 shrink-0" />
          <span className="truncate">{player.birthPlace || "—"}</span>
        </div>
      ),
    },
    {
      id: "status",
      header: "Estado",
      sortValue: (p) => (p.enabled ? p.status : "ZZ_DESHABILITADO"),
      cell: (player) => (
        <div className="space-y-1">
          <StatusBadge entity="player" status={player.status} />
          {!player.enabled && (
            <Badge
              variant="outline"
              className="block w-fit border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400"
            >
              Deshabilitado
            </Badge>
          )}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Acciones",
      align: "right",
      hideOnCard: true,
      cell: (player) => (
        <div className="flex justify-end gap-2">
          <RowActions player={player} />
        </div>
      ),
    },
  ];

  return (
    <DataTable
      rows={players}
      columns={columns}
      getRowKey={(p) => p.id}
      icon={Users}
      title="Lista de Jugadores"
      description="Gestiona todos los jugadores registrados en la plataforma"
      searchable={{
        placeholder: "Buscar por nombre, posición o nacionalidad...",
        getText: (p) =>
          `${p.name} ${positionLabel(p.position)} ${p.nationality ?? ""}`,
      }}
      filters={[
        {
          id: "status",
          label: "Estado",
          icon: Activity,
          // Los valores salen del enum real de Prisma (ACTIVO/LESIONADO/...).
          // Antes se comparaba contra "ACTIVE"/"SUSPENDED", que no existen:
          // el filtro no matcheaba nunca.
          options: [
            { value: "all", label: "Todos" },
            ...PLAYER_STATUS_OPTIONS.map((o) => ({
              value: o.value as string,
              label: o.label,
            })),
            { value: "disabled", label: "Deshabilitados" },
          ],
          test: (player, value) =>
            value === "disabled"
              ? !player.enabled
              : player.enabled && player.status === value,
        },
      ]}
      empty={{
        icon: Users,
        title: "Todavía no hay jugadores",
        description: "Comenzá registrando tu primer jugador.",
        filteredTitle: "No se encontraron jugadores",
        filteredDescription:
          "Ningún jugador coincide con los filtros aplicados.",
      }}
      rowActions={(player) => <RowActions player={player} />}
    />
  );
};

export default PlayersTable;
