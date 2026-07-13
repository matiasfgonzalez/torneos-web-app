import { ChevronRight, Eye } from "lucide-react";
import { EntityCard, EntityCardAvatar } from "@/components/shared/EntityCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { IPlayer } from "@modules/jugadores/types";
import {
  PLAYER_STATUS_COLORS,
  PLAYER_POSITION_LABELS,
  FOOT_LABELS,
  FOOT_COLORS,
} from "@/lib/constants";
import { PlayerPosition, Foot } from "@prisma/client";

function getPositionLabel(position: string | null) {
  if (!position) return "Sin posición";
  return PLAYER_POSITION_LABELS[position as PlayerPosition] ?? position;
}

function getFootLabel(foot: string | null) {
  if (!foot) return "N/A";
  return FOOT_LABELS[foot as Foot] ?? foot;
}

function getFootColor(foot: string | null) {
  if (!foot) return "text-gray-400";
  return FOOT_COLORS[foot as Foot] ?? "text-gray-400";
}

/**
 * Card pública de jugador (F2, anatomía consistente con TournamentCard/
 * TeamCard). `variant="list"` para la vista de lista horizontal.
 */
export function PlayerCard({
  player,
  variant = "grid",
}: Readonly<{
  player: IPlayer;
  variant?: "grid" | "list";
}>) {
  const statusDotColor = PLAYER_STATUS_COLORS[player.status as keyof typeof PLAYER_STATUS_COLORS] ?? "bg-gray-500";

  if (variant === "list") {
    return (
      <EntityCard href={`/jugadores/${player.id}`} aria-label={player.name}>
        <div className="p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="relative">
              <EntityCardAvatar
                src={player.imageUrlFace}
                alt={player.name}
                shape="circle"
                size="sm"
                fallback={
                  <span className="text-xl font-bold text-brand">
                    {player.name.charAt(0)}
                  </span>
                }
              />
              <div
                className={`absolute -bottom-1 -right-1 w-3 h-3 ${statusDotColor} rounded-full border border-white dark:border-gray-800`}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-brand transition-colors truncate">
                  {player.name}
                </h3>
                {player.number != null && (
                  <span className="text-xl font-bold text-brand">
                    #{player.number}
                  </span>
                )}
                <StatusBadge entity="player" status={player.status} />
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span>{getPositionLabel(player.position)}</span>
                {player.nationality && (
                  <>
                    <span aria-hidden="true">•</span>
                    <span>{player.nationality}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 shrink-0">
            <div className="hidden md:flex gap-6 text-sm">
              <div className="text-center">
                <div className="font-bold text-gray-900 dark:text-white">
                  {player.height ? `${player.height}cm` : "N/A"}
                </div>
                <div className="text-gray-500 dark:text-gray-400">Altura</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-gray-900 dark:text-white">
                  {player.weight ? `${player.weight}kg` : "N/A"}
                </div>
                <div className="text-gray-500 dark:text-gray-400">Peso</div>
              </div>
              <div className="text-center">
                <div className={`font-bold ${getFootColor(player.dominantFoot)}`}>
                  {getFootLabel(player.dominantFoot)}
                </div>
                <div className="text-gray-500 dark:text-gray-400">Pie</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-brand group-hover:text-brand-mid transition-colors" />
          </div>
        </div>
      </EntityCard>
    );
  }

  return (
    <EntityCard href={`/jugadores/${player.id}`} aria-label={player.name}>
      <div className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative">
            <EntityCardAvatar
              src={player.imageUrlFace}
              alt={player.name}
              shape="circle"
              fallback={
                <span className="text-2xl font-bold text-brand">
                  {player.name.charAt(0)}
                </span>
              }
            />
            <div
              className={`absolute -bottom-1 -right-1 w-4 h-4 ${statusDotColor} rounded-full border-2 border-white dark:border-gray-800`}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-brand transition-colors truncate">
                {player.name}
              </h3>
              {player.number != null && (
                <span className="text-xl font-bold text-brand">
                  #{player.number}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {getPositionLabel(player.position)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4 py-3 border-y border-gray-100 dark:border-gray-700/50">
          <div className="text-center">
            <div className="text-sm font-bold text-gray-900 dark:text-white">
              {player.height ? `${player.height}cm` : "N/A"}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Altura
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm font-bold text-gray-900 dark:text-white">
              {player.weight ? `${player.weight}kg` : "N/A"}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Peso
            </div>
          </div>
          <div className="text-center">
            <div className={`text-sm font-bold ${getFootColor(player.dominantFoot)}`}>
              {getFootLabel(player.dominantFoot)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Pie
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <StatusBadge entity="player" status={player.status} />
          <div className="flex items-center gap-1 text-brand group-hover:text-brand-mid transition-colors">
            <Eye className="w-4 h-4" />
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </EntityCard>
  );
}
